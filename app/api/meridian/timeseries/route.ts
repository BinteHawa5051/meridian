export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache } from "@/lib/cache";
import { generateSpendOverTime } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const range    = new URL(req.url).searchParams.get("range") ?? "30d";
  const interval = ({ "7d":"7 days","30d":"30 days","90d":"90 days","12m":"365 days" } as Record<string,string>)[range] ?? "30 days";

  try {
    const timeseries = await withCache(`timeseries:${range}`, 60_000, async () => {
      const { rows } = await db.query<{
        date: string; openai: string; anthropic: string; google: string;
        groq: string; mistral: string; other: string; total: string;
      }>(`
        SELECT
          DATE(bucket)                                                           AS date,
          COALESCE(SUM(total_cost) FILTER (WHERE provider = 'openai'),    0)   AS openai,
          COALESCE(SUM(total_cost) FILTER (WHERE provider = 'anthropic'), 0)   AS anthropic,
          COALESCE(SUM(total_cost) FILTER (WHERE provider = 'google'),    0)   AS google,
          COALESCE(SUM(total_cost) FILTER (WHERE provider = 'groq'),      0)   AS groq,
          COALESCE(SUM(total_cost) FILTER (WHERE provider = 'mistral'),   0)   AS mistral,
          COALESCE(SUM(total_cost) FILTER (WHERE provider NOT IN ('openai','anthropic','google','groq','mistral')), 0) AS other,
          COALESCE(SUM(total_cost), 0)                                         AS total
        FROM cost_by_hour
        WHERE bucket >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE(bucket)
        ORDER BY date ASC
      `);
      return rows.map((r) => ({
        date:      r.date,
        openai:    parseFloat(r.openai),
        anthropic: parseFloat(r.anthropic),
        google:    parseFloat(r.google),
        groq:      parseFloat(r.groq),
        mistral:   parseFloat(r.mistral),
        other:     parseFloat(r.other),
        total:     parseFloat(r.total),
      }));
    });

    return NextResponse.json({ timeseries, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/timeseries] error:", err);
    return NextResponse.json({ timeseries: generateSpendOverTime(), generatedAt: new Date().toISOString(), _source: "mock" });
  }
}
