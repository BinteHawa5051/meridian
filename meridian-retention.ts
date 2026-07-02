/**
 * Meridian Retention Cron — run nightly
 * Purges llm_events chunks older than each org's plan retention window.
 *
 * Plan retention:
 *   builder:    7 days
 *   scale:      90 days
 *   enterprise: 365 days
 *
 * Usage:  npx tsx meridian-retention.ts
 * Cron:   0 3 * * *  (every day at 03:00)
 */

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = new Pool({ connectionString: process.env.DATABASE_URL! });

const RETENTION_DAYS: Record<string, number> = {
  builder:    7,
  scale:      90,
  enterprise: 365,
};

async function main() {
  console.info("Retention job started:", new Date().toISOString());

  // Get all orgs with their plan
  const { rows: orgs } = await db.query<{ id: string; slug: string; plan: string }>(
    "SELECT id, slug, plan FROM organizations"
  );

  let totalDeleted = 0;

  for (const org of orgs) {
    const days = RETENTION_DAYS[org.plan] ?? 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { rowCount } = await db.query(
      `DELETE FROM llm_events
       WHERE org_id = $1 AND ts < $2`,
      [org.id, cutoff]
    );

    const deleted = rowCount ?? 0;
    if (deleted > 0) {
      console.info(`${org.slug} (${org.plan}): deleted ${deleted} events older than ${days}d`);
      totalDeleted += deleted;
    }
  }

  console.info(`Retention job complete. Total deleted: ${totalDeleted}`);
  await db.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  await db.end();
  process.exit(1);
});
