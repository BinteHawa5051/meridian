export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache } from "@/lib/cache";
import { generateTopModels } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const range    = new URL(req.url).searchParams.get("range") ?? "30d";
  const interval = ({ "7d":"7 days","30d":"30 days","90d":"90 days","12m":"365 days" } as Record<string,string>)[range] ?? "30 days";

  try {
    const models = await withCache(`models:${range}`, 60_000, async () => {
      const { rows } = await db.query<{
        model: string; provider: string; cost: string;
        requests: string; tokens: string; avg_latency: string;
      }>(`
        SELECT model, provider,
          COALESCE(SUM(total_cost), 0)                                        AS cost,
          COALESCE(SUM(request_count), 0)                                     AS requests,
          COALESCE(SUM(total_input_tokens + total_output_tokens), 0)          AS tokens,
          COALESCE(AVG(avg_latency_ms) / 1000.0, 0)                          AS avg_latency
        FROM cost_by_hour
        WHERE bucket >= NOW() - INTERVAL '${interval}'
        GROUP BY model, provider
        ORDER BY cost DESC
        LIMIT 15
      `);
      const total = rows.reduce((s, r) => s + parseFloat(r.cost), 0) || 1;
      return rows.map((r) => ({
        name:       r.model,
        provider:   r.provider.charAt(0).toUpperCase() + r.provider.slice(1),
        cost:       parseFloat(r.cost),
        requests:   parseInt(r.requests),
        tokens:     parseInt(r.tokens),
        latency:    parseFloat(parseFloat(r.avg_latency).toFixed(2)),
        percentage: parseFloat(((parseFloat(r.cost) / total) * 100).toFixed(1)),
      }));
    });

    return NextResponse.json({ models, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/models] error:", err);
    return NextResponse.json({ models: generateTopModels(), generatedAt: new Date().toISOString(), _source: "mock" });
  }
}
