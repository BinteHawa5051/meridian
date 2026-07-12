import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, getSessionCookieHeader } from "@/lib/auth";

const DEV_LOGIN_EMAIL = "admin@meridian.dev";
const DEV_LOGIN_PASSWORD = "Admin@1234";
const DEV_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Admin",
  email: DEV_LOGIN_EMAIL,
  role: "admin" as const,
  orgId: "00000000-0000-0000-0000-000000000000",
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Local dev fallback: allow the seeded demo account even when the DB is unavailable.
    if (process.env.NODE_ENV !== "production" && normalizedEmail === DEV_LOGIN_EMAIL) {
      const validDevPassword = password === DEV_LOGIN_PASSWORD;
      if (validDevPassword) {
        const token = await createSession(DEV_USER);
        return NextResponse.json(
          { ok: true, user: DEV_USER },
          { headers: { "Set-Cookie": getSessionCookieHeader(token) } }
        );
      }
    }

    // Look up user in DB
    const { rows } = await db.query<{
      id: string; name: string; email: string;
      password_hash: string; role: string; org_id: string;
    }>(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.org_id
       FROM users u WHERE u.email = $1 AND u.active = TRUE`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession({
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role as "admin" | "user",
      orgId: user.org_id,
    });

    return NextResponse.json(
      { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { headers: { "Set-Cookie": getSessionCookieHeader(token) } }
    );
  } catch (err) {
    console.error("[/api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
