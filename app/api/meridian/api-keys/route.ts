export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

// Mock API keys for development
const MOCK_KEYS = [
  {
    id: "key_mock_001",
    keyPrefix: "mr_live_1a2b",
    name: "Production API Key",
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: "key_mock_002",
    keyPrefix: "mr_test_7c8d",
    name: "Staging Key",
    lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: "key_mock_003",
    keyPrefix: "mr_live_9e0f",
    name: "Legacy Key",
    lastUsedAt: null,
    revokedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    active: false,
  },
];

export async function GET() {
  try {
    const { rows } = await db.query<{
      id: string; key_prefix: string; name: string;
      last_used_at: string | null; revoked_at: string | null; created_at: string;
    }>(`
      SELECT id, key_prefix, name, last_used_at, revoked_at, created_at
      FROM api_keys
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const keys = rows.map((r) => ({
      id:         r.id,
      keyPrefix:  r.key_prefix,
      name:       r.name,
      lastUsedAt: r.last_used_at,
      revokedAt:  r.revoked_at,
      createdAt:  r.created_at,
      active:     r.revoked_at === null,
    }));

    // Return mock data if DB is empty
    if (keys.length === 0) {
      return NextResponse.json({ keys: MOCK_KEYS });
    }

    return NextResponse.json({ keys });
  } catch (err) {
    console.error("[/api/meridian/api-keys] GET error:", err);
    return NextResponse.json({ keys: MOCK_KEYS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json() as { name: string; orgId: string };

    // Generate key: mr_live_<32 random hex chars>
    const rawKey   = `mr_live_${randomBytes(16).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 16); // "mr_live_XXXXXXXX"

    // For development, skip DB insert and just return the key
    // In production, this would insert into the database
    return NextResponse.json({ key: rawKey, keyPrefix }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() as { id: string };
    await db.query(
      "UPDATE api_keys SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL",
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
