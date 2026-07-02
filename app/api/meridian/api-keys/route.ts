export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

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

    return NextResponse.json({ keys });
  } catch (err) {
    console.error("[/api/meridian/api-keys] GET error:", err);
    return NextResponse.json({ keys: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, orgId } = await req.json() as { name: string; orgId: string };

    // Generate key: mr_live_<32 random hex chars>
    const rawKey   = `mr_live_${randomBytes(16).toString("hex")}`;
    const keyHash  = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 16); // "mr_live_XXXXXXXX"

    await db.query(`
      INSERT INTO api_keys (org_id, key_hash, key_prefix, name)
      VALUES ($1, $2, $3, $4)
    `, [orgId, keyHash, keyPrefix, name || "New key"]);

    // Return the raw key ONCE — never stored again
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
