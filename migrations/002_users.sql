-- 002: Users table for authentication
-- Run after meridian-schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('admin', 'user', 'viewer')),
  avatar_url    TEXT,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_org    ON users (org_id, active);

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed a default admin user (password: Admin@1234)
-- Change this password immediately after first login
INSERT INTO users (org_id, name, email, password_hash, role)
SELECT id,
       'Admin',
       'admin@meridian.dev',
       '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5Q5Ai',
       'admin'
FROM organizations
LIMIT 1
ON CONFLICT (email) DO NOTHING;
