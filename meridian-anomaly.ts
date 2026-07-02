/**
 * Meridian Anomaly Detection — cron job
 * Runs every 15 minutes via Railway cron.
 *
 * Algorithm:
 *   1. Pull hourly spend per (org, customer, feature) from cost_by_hour
 *   2. Compute 7-day rolling baseline + standard deviation
 *   3. Flag any combination where current 24h spend > baseline + 2.5σ
 *   4. Pass flagged items to Claude claude-haiku-4-5 for triage (cause + action)
 *   5. Store anomaly records
 *   6. Fire alerts for real anomalies
 */

import Anthropic from "@anthropic-ai/sdk";
import { Pool }  from "pg";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db      = new Pool({ connectionString: process.env.DATABASE_URL! });
const claude  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend  = new Resend(process.env.RESEND_API_KEY!);

const Z_SCORE_THRESHOLD = 2.5;

interface SpendSeries {
  orgId:      string;
  customerId: string;
  feature:    string | null;
  // Array of 24 hourly spend values over the past 7 days = 168 buckets
  hourlySpend: number[];
  current24h:  number;
}

interface AnomalyAnalysis {
  real:       boolean;
  confidence: number;
  cause:      string;
  action:     string;
}

// ─── Pull spend series from TimescaleDB ────────────────────────────────────────

async function getSpendSeries(): Promise<SpendSeries[]> {
  const { rows } = await db.query<{
    org_id:       string;
    customer_id:  string;
    feature:      string | null;
    hourly_spend: string[];   // PG returns numeric arrays as strings
    current_24h:  string;
  }>(`
    WITH hourly AS (
      SELECT
        org_id,
        customer_id,
        feature,
        bucket,
        total_cost
      FROM cost_by_hour
      WHERE bucket >= NOW() - INTERVAL '7 days'
    ),
    series AS (
      SELECT
        org_id,
        customer_id,
        feature,
        ARRAY_AGG(total_cost ORDER BY bucket) AS hourly_spend
      FROM hourly
      WHERE bucket < date_trunc('hour', NOW()) - INTERVAL '24 hours'
      GROUP BY org_id, customer_id, feature
    ),
    current AS (
      SELECT
        org_id,
        customer_id,
        feature,
        SUM(total_cost) AS current_24h
      FROM hourly
      WHERE bucket >= date_trunc('hour', NOW()) - INTERVAL '24 hours'
      GROUP BY org_id, customer_id, feature
    )
    SELECT
      s.org_id,
      s.customer_id,
      s.feature,
      s.hourly_spend,
      COALESCE(c.current_24h, 0) AS current_24h
    FROM series s
    JOIN current c USING (org_id, customer_id, feature)
    WHERE COALESCE(c.current_24h, 0) > 0.001  -- ignore sub-cent spend
  `);

  return rows.map(r => ({
    orgId:       r.org_id,
    customerId:  r.customer_id,
    feature:     r.feature,
    hourlySpend: r.hourly_spend.map(Number),
    current24h:  Number(r.current_24h),
  }));
}

// ─── Statistical anomaly detection ────────────────────────────────────────────

function computeZScore(series: SpendSeries): {
  baseline: number;
  stddev:   number;
  zScore:   number;
} {
  const daily: number[] = [];
  for (let i = 0; i < series.hourlySpend.length; i += 24) {
    const day = series.hourlySpend.slice(i, i + 24).reduce((a, b) => a + b, 0);
    if (day > 0) daily.push(day);
  }

  if (daily.length < 3) return { baseline: 0, stddev: 0, zScore: 0 };

  const mean   = daily.reduce((a, b) => a + b, 0) / daily.length;
  const stddev = Math.sqrt(daily.reduce((a, b) => a + (b - mean) ** 2, 0) / daily.length);

  if (stddev === 0) return { baseline: mean, stddev: 0, zScore: 0 };

  return {
    baseline: mean,
    stddev,
    zScore:   (series.current24h - mean) / stddev,
  };
}

// ─── Claude triage ─────────────────────────────────────────────────────────────

async function triageAnomaly(
  series: SpendSeries,
  baseline: number,
  zScore:   number,
): Promise<AnomalyAnalysis> {
  const message = await claude.messages.create({
    model:      "claude-haiku-4-5",  // cheapest capable model for automated jobs
    max_tokens: 300,
    system: `You are a spend anomaly classifier for an LLM cost management platform.
Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`,
    messages: [{
      role:    "user",
      content: `Analyse this LLM spend anomaly:

Feature: ${series.feature ?? "all features"}
7-day daily baseline: $${baseline.toFixed(4)}
Current 24h spend:    $${series.current24h.toFixed(4)}
Z-score:              ${zScore.toFixed(2)}

Determine:
1. Is this a real anomaly or statistical noise? (noise = z < 3.0 and spend < $1)
2. Most likely cause: prompt_regression | traffic_spike | new_feature | agent_loop | bug | unknown
3. What should the engineer check first? (1 sentence, actionable)

Respond with JSON only:
{"real": boolean, "confidence": 0-100, "cause": string, "action": string}`,
    }],
  });

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    return JSON.parse(text) as AnomalyAnalysis;
  } catch {
    return { real: true, confidence: 70, cause: "unknown", action: "Review spend in Meridian dashboard." };
  }
}

// ─── Store and alert ────────────────────────────────────────────────────────────

async function storeAndAlert(
  series:   SpendSeries,
  baseline: number,
  zScore:   number,
  analysis: AnomalyAnalysis,
) {
  // Store anomaly record
  await db.query(
    `INSERT INTO anomalies
       (org_id, customer_id, feature, baseline_usd, current_24h_usd,
        z_score, ai_real, ai_confidence, ai_cause, ai_action, detected_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     ON CONFLICT DO NOTHING`,
    [series.orgId, series.customerId, series.feature,
     baseline.toFixed(8), series.current24h.toFixed(8),
     zScore.toFixed(4), analysis.real, analysis.confidence,
     analysis.cause, analysis.action]
  );

  if (!analysis.real || analysis.confidence < 60) return;

  // Look up alert rules for this org
  const { rows: rules } = await db.query(
    `SELECT ar.*, o.name AS org_name
     FROM alert_rules ar
     JOIN organizations o ON o.id = ar.org_id
     WHERE ar.org_id = $1
       AND ar.dimension IN ('total', 'customer', 'feature')
       AND (ar.last_fired_at IS NULL
            OR ar.last_fired_at < NOW() - (ar.cooldown_seconds || ' seconds')::INTERVAL)`,
    [series.orgId]
  );

  for (const rule of rules) {
    if (rule.channel === "email") {
      await resend.emails.send({
        from:    "Meridian <alerts@meridian.dev>",
        to:      rule.destination,
        subject: `Spend anomaly detected — ${series.feature ?? "overall"} (${zScore.toFixed(1)}σ)`,
        text:    `
Spend anomaly detected on your Meridian account.

Feature:      ${series.feature ?? "all features"}
Baseline:     $${baseline.toFixed(4)}/day (7-day avg)
Today's spend: $${series.current24h.toFixed(4)}
Z-score:      ${zScore.toFixed(1)}σ

AI assessment (${analysis.confidence}% confidence):
Likely cause: ${analysis.cause}
Recommended action: ${analysis.action}

View in dashboard → https://app.meridian.dev/anomalies
        `.trim(),
      });

      // Update last_fired_at to enforce cooldown
      await db.query(
        "UPDATE alert_rules SET last_fired_at = NOW() WHERE id = $1",
        [rule.id]
      );
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.info("Anomaly detection run started:", new Date().toISOString());

  const series = await getSpendSeries();
  console.info(`Analysing ${series.length} spend series`);

  let anomaliesDetected = 0;

  for (const s of series) {
    const { baseline, zScore } = computeZScore(s);

    if (zScore < Z_SCORE_THRESHOLD) continue;

    console.info(
      `Anomaly candidate: org=${s.orgId} feature=${s.feature} ` +
      `baseline=$${baseline.toFixed(4)} current=$${s.current24h.toFixed(4)} z=${zScore.toFixed(2)}`
    );

    const analysis = await triageAnomaly(s, baseline, zScore);
    await storeAndAlert(s, baseline, zScore, analysis);
    anomaliesDetected++;
  }

  console.info(`Done. Anomalies detected: ${anomaliesDetected}`);
  await db.end();
}

main().catch(console.error);
