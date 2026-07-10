export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCustomerData } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range  = searchParams.get("range")  ?? "30d";
  const search = searchParams.get("search") ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const offset = (page - 1) * limit;

  const intervalMap: Record<string, string> = {
    "7d": "7 days", "30d": "30 days", "90d": "90 days", "12m": "365 days",
  };
  const interval = intervalMap[range] ?? "30 days";

  try {
    const { rows } = await db.query<{
      id: string; external_id: string; display_name: string | null;
      plan_tier: string; active: boolean; stripe_customer_id: string | null;
      markup: string; created_at: string;
      revenue: string; ai_cost: string; profit: string; margin: string; requests: string;
      total_count: string;
    }>(`
      SELECT
        c.id, c.external_id, c.display_name, c.plan_tier, c.active,
        c.stripe_customer_id, c.markup, c.created_at,
        COALESCE(SUM(d.total_cost + d.total_markup), 0) AS revenue,
        COALESCE(SUM(d.total_cost), 0)                  AS ai_cost,
        COALESCE(SUM(d.total_markup), 0)                AS profit,
        CASE WHEN SUM(d.total_cost + d.total_markup) = 0 THEN 0
             ELSE ROUND(SUM(d.total_markup) / NULLIF(SUM(d.total_cost + d.total_markup), 0) * 100, 2)
        END AS margin,
        COALESCE(SUM(d.request_count), 0)               AS requests,
        COUNT(*) OVER()                                  AS total_count
      FROM customers c
      LEFT JOIN cost_by_day d ON d.customer_id = c.id
        AND d.bucket >= NOW() - INTERVAL '${interval}'
      WHERE (
        $1 = ''
        OR c.display_name ILIKE '%' || $1 || '%'
        OR c.external_id  ILIKE '%' || $1 || '%'
      )
      GROUP BY c.id, c.external_id, c.display_name, c.plan_tier,
               c.active, c.stripe_customer_id, c.markup, c.created_at
      ORDER BY revenue DESC
      LIMIT ${limit} OFFSET ${offset}
    `, [search]);

    const customers = rows.map((r) => {
      const margin = parseFloat(r.margin);
      let status: "active" | "at-risk" | "churned";
      if (!r.active) status = "churned";
      else if (margin < 10) status = "at-risk";
      else status = "active";

      return {
        id:               r.id,
        externalId:       r.external_id,
        name:             r.display_name ?? r.external_id,
        plan:             r.plan_tier,
        active:           r.active,
        stripeCustomerId: r.stripe_customer_id,
        markup:           parseFloat(r.markup),
        createdAt:        r.created_at,
        revenue:          parseFloat(r.revenue),
        aiCost:           parseFloat(r.ai_cost),
        profit:           parseFloat(r.profit),
        margin,
        requests:         parseInt(r.requests),
        status,
      };
    });

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total: parseInt(rows[0]?.total_count ?? "0"),
        totalPages: Math.ceil(parseInt(rows[0]?.total_count ?? "0") / limit),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/meridian/customers] DB error, falling back to mock:", err);
    return NextResponse.json({
      customers: generateCustomerData(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}

// POST — create a new customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      externalId: string; displayName?: string; planTier?: string;
      markup?: number; stripeCustomerId?: string; orgId: string;
    };

    const { rows } = await db.query<{ id: string }>(`
      INSERT INTO customers
        (org_id, external_id, display_name, plan_tier, markup, stripe_customer_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      body.orgId,
      body.externalId,
      body.displayName ?? null,
      body.planTier ?? "default",
      body.markup ?? 0,
      body.stripeCustomerId ?? null,
    ]);

    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
