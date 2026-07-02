export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateHeatmapData } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";

  const intervalMap: Record<string, string> = {
    "7d": "7 days", "30d": "30 days", "90d": "90 days", "12m": "365 days",
  };
  const interval = intervalMap[range] ?? "30 days";

  try {
    const { rows } = await db.query<{
      dow: number; hour: number; value: string;
    }>(`
      SELECT
        EXTRACT(DOW FROM bucket)::int   AS dow,
        EXTRACT(HOUR FROM bucket)::int  AS hour,
        AVG(request_count)             AS value
      FROM cost_by_hour
      WHERE bucket >= NOW() - INTERVAL '${interval}'
      GROUP BY dow, hour
      ORDER BY dow, hour
    `);

    if (rows.length === 0) {
      return NextResponse.json({
        heatmap: generateHeatmapData(),
        generatedAt: new Date().toISOString(),
        _source: "mock",
      });
    }

    const maxVal = Math.max(...rows.map((r) => parseFloat(r.value)), 1);

    const heatmap = rows.map((r) => ({
      day:   r.dow,
      hour:  r.hour,
      // Normalize to 0–100 scale for the chart
      value: Math.round((parseFloat(r.value) / maxVal) * 100),
    }));

    return NextResponse.json({ heatmap, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/heatmap] DB error, falling back to mock:", err);
    return NextResponse.json({
      heatmap: generateHeatmapData(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}
