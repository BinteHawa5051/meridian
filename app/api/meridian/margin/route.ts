export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCustomerProfitability } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";

  const intervalMap: Record<string, string> = {
    "7d": "7 days", "30d": "30 days", "90d": "90 days", "12m": "365 days",
  };
  const interval = intervalMap[range] ?? "30 days";

  try {
    const { rows } = await db.query<{
      customer: string;
      revenue: string; ai_cost: string; profit: string; margin: string;
    }>(`
      SELECT
        COALESCE(c.display_name, c.external_id) AS customer,
        COALESCE(SUM(d.total_cost + d.total_markup), 0) AS revenue,
        COALESCE(SUM(d.total_cost), 0)                  AS ai_cost,
        COALESCE(SUM(d.total_markup), 0)                AS profit,
        CASE WHEN SUM(d.total_cost + d.total_markup) = 0 THEN 0
             ELSE ROUND(SUM(d.total_markup) / NULLIF(SUM(d.total_cost + d.total_markup), 0) * 100, 2)
        END AS margin
      FROM customers c
      LEFT JOIN cost_by_day d ON d.customer_id = c.id
        AND d.bucket >= NOW() - INTERVAL '${interval}'
      WHERE c.active = TRUE
      GROUP BY c.id, c.display_name, c.external_id
      ORDER BY revenue DESC
      LIMIT 20
    `);

    const customers = rows.map((r) => ({
      customer: r.customer,
      revenue:  parseFloat(r.revenue),
      aiCost:   parseFloat(r.ai_cost),
      profit:   parseFloat(r.profit),
      margin:   parseFloat(r.margin),
    }));

    return NextResponse.json({ customers, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/margin] DB error, falling back to mock:", err);
    return NextResponse.json({
      customers: generateCustomerProfitability(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}
