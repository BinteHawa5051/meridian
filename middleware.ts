import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { canAccess } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

const PUBLIC_PATHS = [
  "/login", "/register",
  "/api/auth/login", "/api/auth/register", "/api/auth/me",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("meridian_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check route-level RBAC
  const topLevel = "/" + pathname.split("/")[1];
  if (!canAccess(session.role as Role, topLevel)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Inject user info as headers for server components
  const res = NextResponse.next();
  res.headers.set("x-user-id",   session.id);
  res.headers.set("x-user-role", session.role);
  res.headers.set("x-org-id",    session.orgId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
