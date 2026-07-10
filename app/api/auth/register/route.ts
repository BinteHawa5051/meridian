import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, getSessionCookieHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, orgName } = await req.json() as {
      name: string; email: string; password: string; orgName?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check email not already taken
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const slug = (orgName ?? name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Create org + user in one transaction
    const { rows } = await db.query<{ user_id: string; org_id: string }>(`
      WITH new_org AS (
        INSERT INTO organizations (slug, name, plan)
        VALUES ($1, $2, 'builder')
        RETURNING id
      ),
      new_user AS (
        INSERT INTO users (name, email, password_hash, role, org_id)
        SELECT $3, $4, $5, 'admin', new_org.id FROM new_org
        RETURNING id, org_id
      )
      SELECT new_user.id AS user_id, new_user.org_id FROM new_user
    `, [slug, orgName ?? name, name, email.toLowerCase().trim(), hash]);

    const token = await createSession({
      id:    rows[0].user_id,
      name,
      email: email.toLowerCase().trim(),
      role:  "admin",
      orgId: rows[0].org_id,
    });

    return NextResponse.json(
      { ok: true },
      { status: 201, headers: { "Set-Cookie": getSessionCookieHeader(token) } }
    );
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
