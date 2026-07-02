export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "redis";
import { generateBudgetEnforcements, generateBudgetAlerts } from "@/lib/mock-data";

let redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", () => { redis = null; });
    await redis.connect().catch(() => { redis = null; });
  }
  return redis;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";

  const intervalMap: Record<string, string> = {
    "7d": "7 days", "30d": "30 days", "90d": "90 days", "12m": "365 days",
  };
  const interval = intervalMap[range] ?? "30 days";

  try {
    const { rows } = await db.query<{
      id: string; customer_name: string; customer_id: string;
      scope: string; scope_value: string | null;
      daily_limit_usd: string | null; monthly_limit_usd: string | null;
      on_breach: string; fallback_model: string | null;
    }>(`
      SELECT
        bc.id,
        COALESCE(c.display_name, c.external_id) AS customer_name,
        bc.customer_id,
        bc.scope,
        bc.scope_value,
        bc.daily_limit_usd,
        bc.monthly_limit_usd,
        bc.on_breach,
        bc.fallback_model
      FROM budget_configs bc
      LEFT JOIN customers c ON c.id = bc.customer_id
      ORDER BY bc.daily_limit_usd DESC NULLS LAST
      LIMIT 50
    `);

    // Try to get current spend from Redis for each customer
    let r: ReturnType<typeof createClient> | null = null;
    try { r = await getRedis(); } catch { /* ignore */ }

    const now = new Date();
    const dateKey  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    const enforcements = await Promise.all(
      rows.map(async (bc) => {
        let spent = 0;
        const limit = parseFloat(bc.monthly_limit_usd ?? bc.daily_limit_usd ?? "0");
        const isMonthly = !!bc.monthly_limit_usd;

        if (r && bc.customer_id) {
          const key = isMonthly
            ? `budget:monthly:*:${bc.customer_id}:${monthKey}`
            : `budget:daily:*:${bc.customer_id}:${dateKey}`;
          try {
            const val = await r.get(key);
            spent = val ? parseFloat(val) : 0;
          } catch { /* ignore */ }
        }

        const pct = limit > 0 ? spent / limit : 0;
        const action = pct >= 1.0
          ? bc.on_breach === "route" ? "auto-switch" : "blocked"
          : pct >= 0.9
          ? "warning"
          : "warning";

        return {
          id:       bc.id,
          customer: bc.customer_name ?? bc.customer_id ?? "Unknown",
          action:   action as "blocked" | "downgraded" | "warning" | "auto-switch",
          model:    bc.scope_value ?? "all models",
          fallback: bc.fallback_model ?? null,
          budget:   limit,
          spent,
          severity: pct >= 1.0 ? "critical" as const : pct >= 0.9 ? "warning" as const : "info" as const,
        };
      })
    );

    return NextResponse.json({
      enforcements,
      alerts: enforcements.filter((e) => e.severity !== "info"),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/meridian/budgets] error, falling back to mock:", err);
    return NextResponse.json({
      enforcements: generateBudgetEnforcements(),
      alerts:       generateBudgetAlerts(),
      generatedAt:  new Date().toISOString(),
      _source: "mock",
    });
  }
}

// POST — create or update a budget config
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      orgId: string; customerId?: string; scope?: string; scopeValue?: string;
      dailyLimitUsd?: number; monthlyLimitUsd?: number;
      onBreach?: string; fallbackModel?: string;
    };

    const { rows } = await db.query<{ id: string }>(`
      INSERT INTO budget_configs
        (org_id, customer_id, scope, scope_value, daily_limit_usd, monthly_limit_usd, on_breach, fallback_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [
      body.orgId,
      body.customerId ?? null,
      body.scope ?? "customer",
      body.scopeValue ?? null,
      body.dailyLimitUsd ?? null,
      body.monthlyLimitUsd ?? null,
      body.onBreach ?? "block",
      body.fallbackModel ?? null,
    ]);

    return NextResponse.json({ id: rows[0]?.id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
