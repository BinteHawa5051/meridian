export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateStackedBarData } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const { rows } = await db.query<{
      dow: number; day: string;
      openai: string; anthropic: string; google: string; mistral: string; groq: string;
    }>(`
      SELECT
        EXTRACT(DOW FROM bucket)::int                                         AS dow,
        TO_CHAR(bucket, 'Dy')                                                 AS day,
        COALESCE(SUM(total_cost) FILTER (WHERE provider = 'openai'),    0)   AS openai,
        COALESCE(SUM(total_cost) FILTER (WHERE provider = 'anthropic'), 0)   AS anthropic,
        COALESCE(SUM(total_cost) FILTER (WHERE provider = 'google'),    0)   AS google,
        COALESCE(SUM(total_cost) FILTER (WHERE provider = 'mistral'),   0)   AS mistral,
        COALESCE(SUM(total_cost) FILTER (WHERE provider = 'groq'),      0)   AS groq
      FROM cost_by_hour
      WHERE bucket >= NOW() - INTERVAL '7 days'
      GROUP BY dow, TO_CHAR(bucket, 'Dy')
      ORDER BY dow ASC
    `);

    const stackedBar = rows.map((r) => ({
      day:       r.day,
      OpenAI:    parseFloat(r.openai),
      Anthropic: parseFloat(r.anthropic),
      Google:    parseFloat(r.google),
      Mistral:   parseFloat(r.mistral),
      Groq:      parseFloat(r.groq),
    }));

    if (stackedBar.length === 0) {
      return NextResponse.json({
        stackedBar: generateStackedBarData(),
        generatedAt: new Date().toISOString(),
        _source: "mock",
      });
    }

    return NextResponse.json({ stackedBar, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/stacked-bar] DB error, falling back to mock:", err);
    return NextResponse.json({
      stackedBar: generateStackedBarData(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}
