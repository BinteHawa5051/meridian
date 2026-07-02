export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [eventsRes, statsRes] = await Promise.all([
      db.query<{
        id: string; customer_id: string | null; llm_event_id: string;
        stripe_event_id: string | null; amount_usd: string;
        status: string; emitted_at: string; confirmed_at: string | null; retry_count: number;
      }>(`
        SELECT id, customer_id, llm_event_id, stripe_event_id,
               amount_usd, status, emitted_at, confirmed_at, retry_count
        FROM stripe_meter_events
        ORDER BY emitted_at DESC
        LIMIT 100
      `),
      db.query<{
        total_billed: string; pending_count: string;
        failed_count: string; confirmed_count: string;
      }>(`
        SELECT
          COALESCE(SUM(amount_usd), 0)                              AS total_billed,
          COUNT(*) FILTER (WHERE status = 'pending')                AS pending_count,
          COUNT(*) FILTER (WHERE status = 'failed')                 AS failed_count,
          COUNT(*) FILTER (WHERE status = 'confirmed')              AS confirmed_count
        FROM stripe_meter_events
      `),
    ]);

    const events = eventsRes.rows.map((r) => ({
      id:            r.id,
      customerId:    r.customer_id,
      llmEventId:    r.llm_event_id,
      stripeEventId: r.stripe_event_id,
      amountUsd:     parseFloat(r.amount_usd),
      status:        r.status as "pending" | "confirmed" | "failed",
      emittedAt:     r.emitted_at,
      confirmedAt:   r.confirmed_at,
      retryCount:    r.retry_count,
    }));

    const s = statsRes.rows[0];
    const stats = {
      totalBilled:    parseFloat(s.total_billed),
      pendingCount:   parseInt(s.pending_count),
      failedCount:    parseInt(s.failed_count),
      confirmedCount: parseInt(s.confirmed_count),
    };

    return NextResponse.json({ events, stats });
  } catch (err) {
    console.error("[/api/meridian/billing] error:", err);
    return NextResponse.json({
      events: [],
      stats: { totalBilled: 0, pendingCount: 0, failedCount: 0, confirmedCount: 0 },
    });
  }
}
