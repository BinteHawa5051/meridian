export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateActivityFeed } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  try {
    // Pull recent anomalies + recent llm_events budget triggers
    const { rows } = await db.query<{
      id: string; type: string; description: string;
      customer_name: string | null; ts: string; severity: string;
    }>(`
      (
        SELECT
          a.id::text,
          'budget-exceeded' AS type,
          COALESCE(c.display_name, c.external_id, 'Unknown') || ' — anomaly detected: ' ||
            a.ai_cause || ' (' || ROUND(a.z_score::numeric, 1) || 'σ)' AS description,
          COALESCE(c.display_name, c.external_id)                        AS customer_name,
          a.detected_at                                                   AS ts,
          CASE WHEN a.z_score > 4 THEN 'critical'
               WHEN a.z_score > 3 THEN 'warning'
               ELSE 'info' END                                           AS severity
        FROM anomalies a
        LEFT JOIN customers c ON c.id::text = a.customer_id::text
        ORDER BY a.detected_at DESC
        LIMIT ${limit}
      )
      UNION ALL
      (
        SELECT
          gen_random_uuid()::text,
          'invoice',
          'Stripe meter events emitted — batch processed',
          NULL,
          emitted_at::text,
          'success'
        FROM stripe_meter_events
        WHERE status = 'confirmed'
        ORDER BY emitted_at DESC
        LIMIT 5
      )
      ORDER BY ts DESC
      LIMIT ${limit}
    `);

    const activities = rows.map((r) => ({
      id:          r.id,
      type:        r.type as "budget-exceeded" | "model-switch" | "invoice" | "policy" | "api-key",
      description: r.description,
      customer:    r.customer_name ?? undefined,
      timestamp:   new Date(r.ts),
      severity:    r.severity as "info" | "warning" | "critical" | "success",
    }));

    // If we got no real data (empty DB), fall through to mock
    if (activities.length === 0) {
      return NextResponse.json({
        activities: generateActivityFeed(),
        generatedAt: new Date().toISOString(),
        _source: "mock",
      });
    }

    return NextResponse.json({ activities, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/activity] DB error, falling back to mock:", err);
    return NextResponse.json({
      activities: generateActivityFeed(),
      generatedAt: new Date().toISOString(),
      _source: "mock",
    });
  }
}
