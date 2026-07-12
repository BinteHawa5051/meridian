const { Pool } = require("pg");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const db = new Pool({ connectionString: process.env.DATABASE_URL });

  await db.query(
    "CREATE TABLE IF NOT EXISTS organizations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, plan TEXT NOT NULL DEFAULT 'builder', event_limit_monthly BIGINT NOT NULL DEFAULT 500000, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );

  await db.query(
    "CREATE TABLE IF NOT EXISTS api_keys (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, key_hash TEXT NOT NULL UNIQUE, key_prefix TEXT NOT NULL, name TEXT NOT NULL DEFAULT 'Default key', revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );

  await db.query(
    "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', avatar_url TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );

  const orgSlug = "acme-demo";
  const orgName = "Acme Demo";

  const orgRes = await db.query(
    "INSERT INTO organizations (slug, name, plan, event_limit_monthly) VALUES ($1, $2, 'scale', 500000) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id",
    [orgSlug, orgName]
  );
  const orgId = orgRes.rows[0].id;

  const rawKey = "mr_live_" + crypto.randomBytes(24).toString("hex");
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 8);

  await db.query(
    "INSERT INTO api_keys (org_id, key_hash, key_prefix, name, revoked_at) VALUES ($1, $2, $3, $4, NULL) ON CONFLICT (key_hash) DO NOTHING",
    [orgId, keyHash, keyPrefix, "Copilot Seed Key"]
  );

  const adminEmail = "admin@meridian.dev";
  const adminPassword = "Admin@1234";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db.query(
    "INSERT INTO users (org_id, name, email, password_hash, role, active) VALUES ($1, $2, $3, $4, 'admin', TRUE) ON CONFLICT (email) DO UPDATE SET org_id = EXCLUDED.org_id, name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, active = TRUE, updated_at = NOW()",
    [orgId, "Admin", adminEmail, passwordHash]
  );

  console.log(JSON.stringify({ orgId, orgSlug, apiKey: rawKey, adminEmail, adminPassword }, null, 2));
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
