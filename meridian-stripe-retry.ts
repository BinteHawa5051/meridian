/**
 * Meridian Stripe Retry Worker — cron job
 * Retries failed stripe_meter_events with exponential backoff.
 * Max 5 retries — after that, marks as permanently failed.
 *
 * Usage:  npx tsx meridian-stripe-retry.ts
 * Cron:   */15 * * * *  (every 15 minutes)
 */

import { Pool }  from "pg";
import Stripe    from "stripe";
import dotenv    from "dotenv";

dotenv.config({ path: ".env.local" });

const db     = new Pool({ connectionString: process.env.DATABASE_URL! });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.accia" as any });

const MAX_RETRIES = 5;

async function main() {
  console.info("Stripe retry worker started:", new Date().toISOString());

  const { rows } = await db.query<{
    id: string; org_id: string; customer_id: string;
    llm_event_id: string; amount_usd: string;
    stripe_customer_id: string; emitted_at: string; retry_count: number;
  }>(`
    SELECT
      sme.id, sme.org_id, sme.customer_id, sme.llm_event_id,
      sme.amount_usd, sme.retry_count, sme.emitted_at,
      c.stripe_customer_id
    FROM stripe_meter_events sme
    JOIN customers c ON c.id = sme.customer_id
    WHERE sme.status = 'failed'
      AND sme.retry_count < $1
      AND sme.emitted_at < NOW() - INTERVAL '5 minutes'
    ORDER BY sme.emitted_at ASC
    LIMIT 100
  `, [MAX_RETRIES]);

  console.info(`Found ${rows.length} failed events to retry`);

  let succeeded = 0;
  let stillFailing = 0;

  for (const row of rows) {
    // Exponential backoff check: 2^retry_count minutes
    const minWaitMs = Math.pow(2, row.retry_count) * 60 * 1000;
    const elapsed   = Date.now() - new Date(row.emitted_at).getTime();
    if (elapsed < minWaitMs) continue;

    try {
      const amountUnits = Math.round(parseFloat(row.amount_usd) * 10_000);
      if (amountUnits <= 0) {
        // Mark as confirmed with zero amount — nothing to bill
        await db.query(
          "UPDATE stripe_meter_events SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1",
          [row.id]
        );
        continue;
      }

      const meterEvent = await stripe.billing.meterEvents.create({
        event_name: "meridian_ai_usage",
        payload: {
          stripe_customer_id: row.stripe_customer_id,
          value:              String(amountUnits),
        },
        timestamp: Math.floor(new Date(row.emitted_at).getTime() / 1000),
      });

      await db.query(`
        UPDATE stripe_meter_events
        SET status = 'confirmed', stripe_event_id = $2, confirmed_at = NOW(),
            retry_count = retry_count + 1
        WHERE id = $1
      `, [row.id, meterEvent.identifier]);

      console.info(`Retried and confirmed: ${row.id} → ${meterEvent.identifier}`);
      succeeded++;
    } catch (err) {
      const newRetry = row.retry_count + 1;
      const newStatus = newRetry >= MAX_RETRIES ? "failed" : "failed";

      await db.query(`
        UPDATE stripe_meter_events
        SET retry_count = $2, emitted_at = NOW()
        WHERE id = $1
      `, [row.id, newRetry]);

      console.error(`Retry ${newRetry}/${MAX_RETRIES} failed for ${row.id}:`, (err as Error).message);
      stillFailing++;
    }
  }

  console.info(`Done. Succeeded: ${succeeded}, Still failing: ${stillFailing}`);
  await db.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  await db.end();
  process.exit(1);
});
