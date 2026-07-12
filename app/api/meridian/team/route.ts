export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Mock team members for development
const MOCK_MEMBERS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Binte Hawa",
    email: "bintehawa5051@gmail.com",
    role: "admin",
    active: true,
    last_login_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Sarah Chen",
    email: "sarah@acme.com",
    role: "user",
    active: true,
    last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Alex Rivera",
    email: "alex@acme.com",
    role: "admin",
    active: true,
    last_login_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Jordan Kim",
    email: "jordan@acme.com",
    role: "viewer",
    active: true,
    last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Taylor Morgan",
    email: "taylor@acme.com",
    role: "user",
    active: true,
    last_login_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Casey Lee",
    email: "casey@acme.com",
    role: "viewer",
    active: false,
    last_login_at: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

    // Return mock data if DB is empty
    if (rows.length === 0) {
      return NextResponse.json({ members: MOCK_MEMBERS });
    }

    return NextResponse.json({ members: rows });
  } catch (err) {
    console.error("[/api/meridian/team] GET error:", err);
    return NextResponse.json({ members: MOCK_MEMBERS });
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
