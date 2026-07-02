export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query<{
      id: string; dimension: string; dimension_value: string | null;
      threshold_usd: string; window: string; channel: string;
      destination: string; last_fired_at: string | null; cooldown_seconds: number;
    }>(`
      SELECT id, dimension, dimension_value, threshold_usd,
             "window", channel, destination, last_fired_at, cooldown_seconds
      FROM alert_rules
      ORDER BY created_at DESC
    `);

    const rules = rows.map((r) => ({
      id:              r.id,
      dimension:       r.dimension,
      dimensionValue:  r.dimension_value,
      thresholdUsd:    parseFloat(r.threshold_usd),
      window:          r.window,
      channel:         r.channel,
      destination:     r.destination,
      lastFiredAt:     r.last_fired_at,
      cooldownSeconds: r.cooldown_seconds,
    }));

    return NextResponse.json({ rules });
  } catch (err) {
    console.error("[/api/meridian/alerts] GET error:", err);
    return NextResponse.json({ rules: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      orgId: string; dimension: string; dimensionValue?: string;
      thresholdUsd: number; window: string; channel: string;
      destination: string; cooldownSeconds?: number;
    };

    const { rows } = await db.query<{ id: string }>(`
      INSERT INTO alert_rules
        (org_id, dimension, dimension_value, threshold_usd, "window",
         channel, destination, cooldown_seconds)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      body.orgId,
      body.dimension,
      body.dimensionValue ?? null,
      body.thresholdUsd,
      body.window,
      body.channel,
      body.destination,
      body.cooldownSeconds ?? 3600,
    ]);

    return NextResponse.json({ id: rows[0]?.id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() as { id: string };
    await db.query("DELETE FROM alert_rules WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
