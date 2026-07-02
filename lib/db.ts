/**
 * Shared PostgreSQL pool for Next.js API routes.
 * Uses the same DATABASE_URL as the backend services.
 * Singleton pattern — reused across hot-reloads in dev.
 */
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { _pgPool?: Pool };

export const db: Pool =
  globalForPg._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgPool = db;
}
