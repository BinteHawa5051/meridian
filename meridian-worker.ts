/**
 * Meridian Worker
 * BullMQ consumer — the async heart of the pipeline.
 *
 * Per batch:
 *   1. Deduplicate via event_id (UNIQUE constraint)
 *   2. Compute cost_usd from pricing table
 *   3. Bulk INSERT into TimescaleDB llm_events
 *   4. Emit Stripe meter events for billable calls
 *   5. Decrement budget counters in Redis
 */

import { Worker, Job }  from "bullmq";
import { Pool }         from "pg";
import { createClient } from "redis";
import Stripe           from "stripe";
import dotenv           from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── Config ───────────────────────────────────────────────────────────────────

const REDIS_URL    = requiredEnv("REDIS_URL");
const DATABASE_URL = requiredEnv("DATABASE_URL");
const STRIPE_KEY   = requiredEnv("STRIPE_SECRET_KEY");
const CONCURRENCY  = Number(process.env.WORKER_CONCURRENCY ?? 5);

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

// ─── Clients ──────────────────────────────────────────────────────────────────

const db     = new Pool({ connectionString: DATABASE_URL, max: 10 });
const redis  = createClient({ url: REDIS_URL });
const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2025-01-27.acacia" });

redis.on("error", (err) => {
  console.error("Redis client error:", err.message);
});

// ─── Pricing table cache ──────────────────────────────────────────────────────
// Prices are per million tokens in USD.

interface ModelPricing {
  inputPricePerMillion:       number;
  cachedInputPricePerMillion: number;
  outputPricePerMillion:      number;
}

let pricingCache: Map<string, ModelPricing> = new Map();
let pricingLoadedAt = 0;

async function getPricing(): Promise<Map<string, ModelPricing>> {
  // Refresh cache every 10 minutes
  if (Date.now() - pricingLoadedAt < 600_000 && pricingCache.size > 0) {
    return pricingCache;
  }
  const { rows } = await db.query<{
    provider: string; model: string;
    input_price_per_million: string;
    cached_input_price_per_million: string;
    output_price_per_million: string;
  }>("SELECT * FROM model_pricing WHERE active = TRUE");

  pricingCache = new Map(
    rows.map((r) => [
      `${r.provider}:${r.model}`,
      {
        inputPricePerMillion:       parseFloat(r.input_price_per_million),
        cachedInputPricePerMillion: parseFloat(r.cached_input_price_per_million),
        outputPricePerMillion:      parseFloat(r.output_price_per_million),
      },
    ])
  );
  pricingLoadedAt = Date.now();
  return pricingCache;
}

function computeCost(
  pricing: ModelPricing,
  inputTokens: number,
  inputTokensCached: number,
  outputTokens: number,
): number {
  const standardInput = Math.max(0, inputTokens - inputTokensCached);
  return (
    (standardInput           * pricing.inputPricePerMillion       / 1_000_000) +
    (inputTokensCached       * pricing.cachedInputPricePerMillion / 1_000_000) +
    (outputTokens            * pricing.outputPricePerMillion      / 1_000_000)
  );
}

// ─── Customer lookup cache ────────────────────────────────────────────────────

interface CustomerInfo {
  id:               string;
  stripeCustomerId: string | null;
  markup:           number;   // e.g. 0.33 = 33% markup
}

async function getCustomer(orgId: string, externalId: string): Promise<CustomerInfo | null> {
  const cacheKey = `customer:${orgId}:${externalId}`;
  const cached   = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as CustomerInfo;

  const { rows } = await db.query<CustomerInfo>(
    `SELECT id, stripe_customer_id AS "stripeCustomerId",
            COALESCE(markup, 0) AS markup
     FROM customers
     WHERE org_id = $1 AND external_id = $2 AND active = TRUE`,
    [orgId, externalId]
  );

  if (rows.length === 0) return null;
  await redis.setEx(cacheKey, 300, JSON.stringify(rows[0]));
  return rows[0];
}

// ─── Stripe meter emission ────────────────────────────────────────────────────

async function emitStripeMeters(
  events: Array<{
    dbEventId: string;
    orgId:     string;
    costUsd:   number;
    markupUsd: number;
    stripeCustomerId: string;
    ts:        Date;
  }>
) {
  for (const ev of events) {
    try {
      // Amount in units of $0.0001 (4 decimal places as integer)
      const amountUnits = Math.round((ev.costUsd + ev.markupUsd) * 10_000);
      if (amountUnits <= 0) continue;

      const meterEvent = await stripe.billing.meterEvents.create({
        event_name: "meridian_ai_usage",
        payload: {
          stripe_customer_id: ev.stripeCustomerId,
          value: String(amountUnits),
        },
        timestamp: Math.floor(ev.ts.getTime() / 1000),
      });

      // Record successful emission
      await db.query(
        `INSERT INTO stripe_meter_events
           (org_id, customer_id, llm_event_id, stripe_event_id,
            amount_usd, status, emitted_at, confirmed_at)
         VALUES ($1, $2, $3, $4, $5, 'confirmed', NOW(), NOW())
         ON CONFLICT (llm_event_id) DO NOTHING`,
        [ev.orgId, ev.dbEventId, ev.dbEventId, meterEvent.identifier,
         (ev.costUsd + ev.markupUsd).toFixed(8)]
      );
    } catch (err) {
      // Record failure for retry
      await db.query(
        `INSERT INTO stripe_meter_events
           (org_id, customer_id, llm_event_id, stripe_event_id,
            amount_usd, status, emitted_at)
         VALUES ($1, $2, $3, 'pending', $4, 'failed', NOW())
         ON CONFLICT (llm_event_id) DO UPDATE SET status = 'failed'`,
        [ev.orgId, ev.dbEventId, ev.dbEventId,
         (ev.costUsd + ev.markupUsd).toFixed(8)]
      );
      console.error("Stripe meter emission failed:", err);
    }
  }
}

// ─── Budget counter update ────────────────────────────────────────────────────

async function updateBudgetCounters(
  orgId: string,
  customerSpend: Map<string, number>,
) {
  const now   = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  const pipeline = redis.multi();
  for (const [customerId, costUsd] of customerSpend) {
    // Daily counter — resets at midnight
    const dailyKey   = `budget:daily:${orgId}:${customerId}:${dateKey}`;
    const monthlyKey = `budget:monthly:${orgId}:${customerId}:${monthKey}`;
    const costStr    = costUsd.toFixed(8);

    pipeline.incrByFloat(dailyKey,   Number(costStr));
    pipeline.expire(dailyKey,  90_000);  // 25h TTL
    pipeline.incrByFloat(monthlyKey, Number(costStr));
    pipeline.expire(monthlyKey, 2_700_000); // ~31d TTL
  }
  await pipeline.exec();
}

// ─── Main job processor ───────────────────────────────────────────────────────

interface EventBatch {
  orgId:  string;
  events: Array<{
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
  }>;
}

async function processBatch(job: Job<EventBatch>) {
  const { orgId, events } = job.data;
  const pricing = await getPricing();

  const rows: unknown[][] = [];
  const stripeEmissions: Parameters<typeof emitStripeMeters>[0] = [];
  const customerSpend = new Map<string, number>();

  for (const ev of events) {
    const key     = `${ev.provider}:${ev.model}`;
    const price   = pricing.get(key);
    const costUsd = price
      ? computeCost(price, ev.inputTokens, ev.inputTokensCached ?? 0, ev.outputTokens)
      : 0;

    // Look up customer for markup and Stripe ID
    const customer = await getCustomer(orgId, ev.customerId);
    const markupUsd = customer ? costUsd * customer.markup : 0;

    // Accumulate budget spend
    customerSpend.set(
      ev.customerId,
      (customerSpend.get(ev.customerId) ?? 0) + costUsd
    );

    const ts = new Date();
    rows.push([
      ts,
      orgId,
      customer?.id ?? null,
      ev.eventId,         // idempotency key
      ev.provider,
      ev.model,
      ev.feature   ?? null,
      ev.environment ?? "production",
      ev.inputTokens,
      ev.inputTokensCached ?? 0,
      ev.outputTokens,
      costUsd.toFixed(8),
      markupUsd.toFixed(8),
      true,               // budget_checked
      customer?.stripeCustomerId != null, // billing_emitted flag
      ev.latencyMs ?? null,
      JSON.stringify(ev.metadata ?? {}),
    ]);

    if (customer?.stripeCustomerId) {
      stripeEmissions.push({
        dbEventId:        ev.eventId,
        orgId,
        costUsd,
        markupUsd,
        stripeCustomerId: customer.stripeCustomerId,
        ts,
      });
    }
  }

  // Bulk INSERT with ON CONFLICT DO NOTHING for deduplication
  if (rows.length > 0) {
    const placeholders = rows
      .map((_, i) => {
        const base = i * 17;
        return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11},$${base+12},$${base+13},$${base+14},$${base+15},$${base+16},$${base+17})`;
      })
      .join(",");

    await db.query(
      `INSERT INTO llm_events
         (ts, org_id, customer_id, event_id, provider, model, feature,
          environment, input_tokens, input_tokens_cached, output_tokens,
          cost_usd, markup_usd, budget_checked, billing_emitted,
          latency_ms, metadata)
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      rows.flat()
    );
  }

  // Update Redis budget counters
  await updateBudgetCounters(orgId, customerSpend);

  // Emit Stripe meter events (non-blocking failures logged, retried separately)
  if (stripeEmissions.length > 0) {
    await emitStripeMeters(stripeEmissions);
  }

  return { processed: rows.length };
}

// ─── Worker bootstrap ─────────────────────────────────────────────────────────

async function main() {
  console.info(`[startup] REDIS_URL=${maskConnectionUrl(REDIS_URL)}`);
  await redis.connect();

  const worker = new Worker<EventBatch>(
    "llm-events",
    processBatch,
    {
      connection:  { url: REDIS_URL },
      concurrency: CONCURRENCY,
    }
  );

  worker.on("completed", (job) => {
    console.info(`Job ${job.id} completed: ${JSON.stringify(job.returnvalue)}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.info(`Worker running (concurrency=${CONCURRENCY})`);

  const shutdown = async () => {
    await worker.close();
    await redis.quit();
    await db.end();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT",  shutdown);
}

main().catch(console.error);
