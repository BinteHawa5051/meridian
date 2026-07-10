export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const orgId  = req.headers.get("x-org-id");
  const userId = req.headers.get("x-user-id");

  try {
    const body = await req.json() as {
      orgName?: string; orgSlug?: string; retention?: string;
      profileName?: string; profileEmail?: string; avatarUrl?: string;
      notifs?: Record<string, boolean>; twoFA?: boolean; keyExpiry?: string;
    };

    // Update org name/slug
    if (body.orgName && orgId) {
      await db.query(
        "UPDATE organizations SET name = $1, slug = $2, updated_at = NOW() WHERE id = $3",
        [body.orgName, body.orgSlug ?? body.orgName.toLowerCase().replace(/\s+/g, "-"), orgId]
      );
    }

    // Update user profile
    if ((body.profileName || body.profileEmail || body.avatarUrl) && userId) {
      await db.query(
        `UPDATE users SET
           name       = COALESCE($1, name),
           email      = COALESCE($2, email),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
         WHERE id = $4`,
        [body.profileName || null, body.profileEmail || null, body.avatarUrl || null, userId]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
