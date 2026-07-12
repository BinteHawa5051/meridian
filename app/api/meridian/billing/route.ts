export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Mock data for development when DB is empty
const MOCK_EVENTS = [
  {
    id: "me_001",
    customerId: "cus_001",
    llmEventId: "0f5a8d4e-6e32-4dd3-8dd2-4ebc1e4f00a1",
    stripeEventId: "evt_1Pmock001",
    amountUsd: 124.58,
    status: "confirmed" as const,
    emittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
  {
    id: "me_002",
    customerId: "cus_002",
    llmEventId: "4e66a5b0-2e6f-4a19-8c4a-4f4f1dfe00b2",
    stripeEventId: null,
    amountUsd: 38.12,
    status: "pending" as const,
    emittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 1,
  },
  {
    id: "me_003",
    customerId: "cus_003",
    llmEventId: "b71c9f9f-8a1d-4af1-a2c0-0b4b1c5f00c3",
    stripeEventId: "evt_1Pmock003",
    amountUsd: 219.74,
    status: "failed" as const,
    emittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 2,
  },
  {
    id: "me_004",
    customerId: "cus_001",
    llmEventId: "a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    stripeEventId: "evt_1Pmock004",
    amountUsd: 87.32,
    status: "confirmed" as const,
    emittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
  {
    id: "me_005",
    customerId: "cus_004",
    llmEventId: "f1e2d3c4-b5a6-7f8e-9d0c-1a2b3c4d5e6f",
    stripeEventId: null,
    amountUsd: 156.89,
    status: "pending" as const,
    emittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 0,
  },
  {
    id: "me_006",
    customerId: "cus_002",
    llmEventId: "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    stripeEventId: "evt_1Pmock006",
    amountUsd: 42.15,
    status: "confirmed" as const,
    emittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 1 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
  {
    id: "me_007",
    customerId: "cus_005",
    llmEventId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    stripeEventId: null,
    amountUsd: 298.45,
    status: "failed" as const,
    emittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 3,
  },
  {
    id: "me_008",
    customerId: "cus_001",
    llmEventId: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    stripeEventId: "evt_1Pmock008",
    amountUsd: 67.23,
    status: "confirmed" as const,
    emittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
  {
    id: "me_009",
    customerId: "cus_003",
    llmEventId: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    stripeEventId: null,
    amountUsd: 112.76,
    status: "pending" as const,
    emittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 1,
  },
  {
    id: "me_010",
    customerId: "cus_006",
    llmEventId: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    stripeEventId: "evt_1Pmock010",
    amountUsd: 183.91,
    status: "confirmed" as const,
    emittedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
];

const MOCK_STATS = {
  totalBilled: MOCK_EVENTS.reduce((sum, e) => sum + e.amountUsd, 0),
  pendingCount: MOCK_EVENTS.filter((e) => e.status === "pending").length,
  failedCount: MOCK_EVENTS.filter((e) => e.status === "failed").length,
  confirmedCount: MOCK_EVENTS.filter((e) => e.status === "confirmed").length,
};

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

    // Return mock data if DB is empty
    if (events.length === 0) {
      return NextResponse.json({ events: MOCK_EVENTS, stats: MOCK_STATS });
    }

    return NextResponse.json({ events, stats });
  } catch (err) {
    console.error("[/api/meridian/billing] error:", err);
    return NextResponse.json({ events: MOCK_EVENTS, stats: MOCK_STATS });
  }
}
