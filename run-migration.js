// Run from repo root: node run-migration.js

const fs   = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const { Pool } = require("pg");
const bcrypt   = require("bcryptjs");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Connecting to:", process.env.DATABASE_URL?.slice(0, 40) + "...");

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name          TEXT        NOT NULL,
      email         TEXT        NOT NULL UNIQUE,
      password_hash TEXT        NOT NULL,
      role          TEXT        NOT NULL DEFAULT 'user'
                                CHECK (role IN ('admin','user','viewer')),
      avatar_url    TEXT,
      active        BOOLEAN     NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log("✓ users table created");

  await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_users_org   ON users (org_id, active)`);
  console.log("✓ indexes created");

  // Get first org
  const { rows: orgs } = await db.query("SELECT id, name FROM organizations LIMIT 1");
  if (orgs.length === 0) {
    console.log("⚠ No org found — running seed-auth.js first...");
    return;
  }
  const orgId = orgs[0].id;
  console.log("✓ Using org:", orgs[0].name, "(", orgId, ")");

  // Seed admin user
  const hash = await bcrypt.hash("Admin@1234", 12);
  const { rowCount } = await db.query(`
    INSERT INTO users (org_id, name, email, password_hash, role)
    VALUES ($1, 'Admin', 'admin@meridian.dev', $2, 'admin')
    ON CONFLICT (email) DO NOTHING
  `, [orgId, hash]);

  if (rowCount > 0) {
    console.log("✓ Admin user created");
  } else {
    console.log("✓ Admin user already exists");
  }

  console.log("\n=== Login credentials ===");
  console.log("  Email:    admin@meridian.dev");
  console.log("  Password: Admin@1234");
  console.log("========================\n");
}

main()
  .then(() => db.end())
  .catch((err) => {
    console.error("✗ Error:", err.message);
    db.end();
    process.exit(1);
  });
