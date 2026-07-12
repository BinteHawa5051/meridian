// Run from repo root: node run-migration.js
// Uses dashboard/node_modules which has all required packages

const path = require("path");

// Point Node to dashboard node_modules
const dashboardModules = path.join(__dirname, "node_modules");
require("module").Module._nodeModulePaths = function() { return [dashboardModules]; };

const dotenv = require(path.join(dashboardModules, "dotenv"));
dotenv.config({ path: path.join(__dirname, ".env.local") });

const { Pool } = require(path.join(dashboardModules, "pg"));
const bcrypt   = require(path.join(dashboardModules, "bcryptjs"));

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
