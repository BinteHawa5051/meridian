/**
 * Meridian Ingest API
 * Fastify server — stateless, p99 < 20ms target
 *
 * Responsibilities:
 *   1. Authenticate API key (SHA-256 hash lookup, Redis-cached)
 *   2. Check org event quota (Redis counter)
 *   3. Enqueue batch to BullMQ
 *   4. Return 202 Accepted immediately
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createClient }  from "redis";
import { Queue }         from "bullmq";
import { createHash }    from "crypto";
import { Pool }          from "pg";
import dotenv            from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT          = Number(process.env.PORT ?? 3001);
const REDIS_URL     = requiredEnv("REDIS_URL");
const DATABASE_URL  = requiredEnv("DATABASE_URL");
const API_KEY_TTL   = 60;          // seconds to cache key → org mapping
const QUOTA_TTL     = 86_400;      // 24h rolling quota window

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function maskConnectionUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "<invalid-url>";
  }
}

// ─── Connections ──────────────────────────────────────────────────────────────

const redis = createClient({ url: REDIS_URL });
const db    = new Pool({ connectionString: DATABASE_URL });

const ingestQueue = new Queue("llm-events", {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail:     { count: 5000 },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawEvent {
  eventId:            string;
  customerId:         string;
  provider:           string;
  model:              string;
  feature?:           string;
  environment?:       string;
  inputTokens:        number;
  inputTokensCached?: number;
  outputTokens:       number;
  latencyMs?:         number;
  metadata?:          Record<string, unknown>;
}

interface IngestBody {
  events: RawEvent[];
}

interface OrgContext {
  orgId:              string;
  plan:               string;
  eventLimitMonthly:  number;
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

async function resolveOrg(rawKey: string): Promise<OrgContext | null> {
  const hash      = createHash("sha256").update(rawKey).digest("hex");
  const cacheKey  = `apikey:${hash}`;

  // Fast path: Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as OrgContext;

  // Slow path: PostgreSQL lookup
  const { rows } = await db.query<OrgContext & { revoked_at: string | null }>(
    `SELECT o.id AS "orgId", o.plan, o.event_limit_monthly AS "eventLimitMonthly"
     FROM api_keys k
     JOIN organizations o ON o.id = k.org_id
     WHERE k.key_hash = $1 AND k.revoked_at IS NULL`,
    [hash]
  );

  if (rows.length === 0) return null;

  const ctx: OrgContext = {
    orgId:             rows[0].orgId,
    plan:              rows[0].plan,
    eventLimitMonthly: rows[0].eventLimitMonthly,
  };

  // Cache for TTL seconds
  await redis.setEx(cacheKey, API_KEY_TTL, JSON.stringify(ctx));
  return ctx;
}

// ─── Quota enforcement ────────────────────────────────────────────────────────

async function checkAndIncrementQuota(
  orgId: string,
  count: number,
  limit: number,
): Promise<{ allowed: boolean; current: number }> {
  const now      = new Date();
  const monthKey = `quota:${orgId}:${now.getFullYear()}-${now.getMonth() + 1}`;

  const pipeline = redis.multi();
  pipeline.incrBy(monthKey, count);
  pipeline.expire(monthKey, QUOTA_TTL * 32); // ~1 month TTL
  const [newCount] = await pipeline.exec() as [number, unknown];

  if (newCount > limit) {
    // Roll back the increment
    await redis.decrBy(monthKey, count);
    return { allowed: false, current: newCount - count };
  }

  return { allowed: true, current: newCount };
}

// ─── Fastify app ──────────────────────────────────────────────────────────────

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? "info" },
    trustProxy: true,
  });

  // Health check
  app.get("/health", async () => ({ ok: true }));

  // POST /v1/ingest — main ingest endpoint
  app.post<{ Body: IngestBody }>(
    "/v1/ingest",
    {
      schema: {
        body: {
          type: "object",
          required: ["events"],
          properties: {
            events: {
              type: "array",
              minItems: 1,
              maxItems: 1000,
              items: {
                type: "object",
                required: ["eventId", "customerId", "provider", "model", "inputTokens", "outputTokens"],
                properties: {
                  eventId:           { type: "string", format: "uuid" },
                  customerId:        { type: "string", minLength: 1 },
                  provider:          { type: "string", enum: ["openai", "anthropic", "google", "bedrock"] },
                  model:             { type: "string" },
                  feature:           { type: "string" },
                  environment:       { type: "string" },
                  inputTokens:       { type: "integer", minimum: 0 },
                  inputTokensCached: { type: "integer", minimum: 0 },
                  outputTokens:      { type: "integer", minimum: 0 },
                  latencyMs:         { type: "integer", minimum: 0 },
                  metadata:          { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IngestBody }>, reply: FastifyReply) => {
      // 1. Authenticate
      const rawKey = (request.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
      if (!rawKey) return reply.status(401).send({ error: "Missing Authorization header" });

      const org = await resolveOrg(rawKey);
      if (!org) return reply.status(401).send({ error: "Invalid or revoked API key" });

      // 2. Check quota
      const { events } = request.body;
      const { allowed, current } = await checkAndIncrementQuota(
        org.orgId, events.length, org.eventLimitMonthly
      );

      if (!allowed) {
        return reply.status(429).send({
          error: "Monthly event limit exceeded",
          limit: org.eventLimitMonthly,
          current,
          plan: org.plan,
          upgrade: "https://app.meridian.dev/settings/billing",
        });
      }

      // 3. Enqueue — fire and forget
      await ingestQueue.add(
        "process-batch",
        { orgId: org.orgId, events },
        { priority: org.plan === "enterprise" ? 1 : 10 }
      );

      // 4. Return 202 immediately — never block the caller
      return reply.status(202).send({
        queued:            events.length,
        duplicateSkipped:  0, // dedup happens in the worker
      });
    }
  );

  // POST /v1/ingest/batch — NDJSON bulk import
  app.post(
    "/v1/ingest/batch",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawKey = (request.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
      const org    = await resolveOrg(rawKey);
      if (!org) return reply.status(401).send({ error: "Unauthorized" });

      // Parse NDJSON
      const body  = request.body as string;
      const lines = body.split("\n").filter(Boolean);
      const events: RawEvent[] = lines.map((l) => JSON.parse(l));

      await ingestQueue.add("process-batch", { orgId: org.orgId, events }, { priority: 100 });
      return reply.status(202).send({ queued: events.length });
    }
  );

  return app;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function main() {
  console.info(`[startup] REDIS_URL=${maskConnectionUrl(REDIS_URL)}`);
  await redis.connect();
  const app = await buildApp();

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`Ingest API listening on :${PORT}`);

  // Graceful shutdown
  const shutdown = async () => {
    await app.close();
    await redis.quit();
    await db.end();
    await ingestQueue.close();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT",  shutdown);
}

main().catch(console.error);
