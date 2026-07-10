export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const orgId = req.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = await db.query<{
      id: string; name: string; email: string;
      role: string; active: boolean; last_login_at: string | null; created_at: string;
    }>(`
      SELECT id, name, email, role, active, last_login_at, created_at
      FROM users WHERE org_id = $1
      ORDER BY created_at ASC
    `, [orgId]);

    return NextResponse.json({ members: rows });
  } catch (err) {
    console.error("[/api/meridian/team] GET error:", err);
    return NextResponse.json({ members: [] });
  }
}

export async function POST(req: NextRequest) {
  const orgId = req.headers.get("x-org-id");
  const role  = req.headers.get("x-user-role");
  if (!orgId || role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const { name, email, memberRole } = await req.json() as {
      name: string; email: string; memberRole: string;
    };

    const tempPassword = Math.random().toString(36).slice(2) + "A1!";
    const hash = await bcrypt.hash(tempPassword, 12);

    await db.query(`
      INSERT INTO users (org_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [orgId, name, email.toLowerCase(), hash, memberRole ?? "user"]);

    return NextResponse.json({ ok: true, tempPassword }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const orgId = req.headers.get("x-org-id");
  const role  = req.headers.get("x-user-role");
  if (!orgId || role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const { id, newRole } = await req.json() as { id: string; newRole: string };
    await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 AND org_id = $3",
      [newRole, id, orgId]
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const orgId = req.headers.get("x-org-id");
  const role  = req.headers.get("x-user-role");
  if (!orgId || role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const { id } = await req.json() as { id: string };
    await db.query(
      "UPDATE users SET active = FALSE WHERE id = $1 AND org_id = $2",
      [id, orgId]
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
