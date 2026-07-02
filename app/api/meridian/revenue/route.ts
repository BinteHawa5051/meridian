export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateRevenueData } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "12m";

  // Revenue route always shows 12 months regardless of range for trend context
  try {
    const { rows } = await db.query<{
      month: string; revenue: string; cost: string; margin: string;
    }>(`
      SELECT
        TO_CHAR(date_trunc('month', bucket), 'Mon') AS month,
        COALESCE(SUM(total_cost + total_markup), 0) AS revenue,
        COALESCE(SUM(total_cost), 0)                AS cost,
        CASE WHEN SUM(total_cost + total_markup) = 0 THEN 0
             ELSE ROUND(SUM(total_markup) / NULLIF(SUM(total_cost + total_markup), 0) * 100, 1)
        END AS margin
      FROM cost_by_day
      WHERE bucket >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', bucket)
      ORDER BY date_trunc('month', bucket) ASC
    `);

    const revenue = rows.map((r) => ({
      month:   r.month,
      revenue: parseFloat(r.revenue),
      cost:    parseFloat(r.cost),
      margin:  parseFloat(r.margin),
    }));

    if (revenue.length === 0) {
      return NextResponse.json({
        revenue: generateRevenueData(),
        generatedAt: new Date().toISOString(),
        _source: "mock",
      });
    }

    return NextResponse.json({ revenue, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/revenue] DB error, falling back to mock:", err);
    return NextResponse.json({
      revenue: generateRevenueData(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}
