import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "meridian-dev-secret-change-in-production"
);

const COOKIE = "meridian_session";
const EXPIRY = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  role:  "admin" | "user";
  orgId: string;
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY}s`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getSessionCookieHeader(token: string) {
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${EXPIRY}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
