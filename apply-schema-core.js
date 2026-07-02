require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const sql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'builder' CHECK (plan IN ('builder', 'scale', 'enterprise')),
  stripe_customer_id TEXT,
  event_limit_monthly BIGINT NOT NULL DEFAULT 500000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default key',
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  display_name TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'default',
  markup NUMERIC(6,4) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_customers_org ON customers (org_id, active);

CREATE TABLE IF NOT EXISTS budget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'customer' CHECK (scope IN ('customer', 'feature', 'model', 'org')),
  scope_value TEXT,
  daily_limit_usd NUMERIC(12,4),
  monthly_limit_usd NUMERIC(12,4),
  on_breach TEXT NOT NULL DEFAULT 'block' CHECK (on_breach IN ('block', 'route', 'alert')),
  fallback_model TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_configs_customer ON budget_configs (org_id, customer_id);

CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('total','customer','feature','model')),
  dimension_value TEXT,
  threshold_usd NUMERIC(12,4) NOT NULL,
  "window" TEXT NOT NULL CHECK ("window" IN ('1h','24h','7d','month')),
  channel TEXT NOT NULL CHECK (channel IN ('email','slack','webhook','pagerduty')),
  destination TEXT NOT NULL,
  last_fired_at TIMESTAMPTZ,
  cooldown_seconds INTEGER NOT NULL DEFAULT 3600,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_price_per_million NUMERIC(12,8) NOT NULL,
  cached_input_price_per_million NUMERIC(12,8) NOT NULL DEFAULT 0,
  output_price_per_million NUMERIC(12,8) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, model)
);

INSERT INTO model_pricing (provider, model, input_price_per_million, cached_input_price_per_million, output_price_per_million)
VALUES
  ('openai', 'gpt-4o', 2.50, 0.625, 10.00),
  ('openai', 'gpt-4o-mini', 0.15, 0.075, 0.60),
  ('openai', 'gpt-4.1', 2.00, 0.50, 8.00),
  ('openai', 'o1', 15.00, 7.50, 60.00),
  ('openai', 'o4-mini', 1.10, 0.275, 4.40),
  ('openai', 'text-embedding-3-small', 0.02, 0, 0),
  ('openai', 'text-embedding-3-large', 0.13, 0, 0),
  ('anthropic', 'claude-opus-4-6', 15.00, 1.50, 75.00),
  ('anthropic', 'claude-sonnet-4-6', 3.00, 0.30, 15.00),
  ('anthropic', 'claude-haiku-4-5', 0.80, 0.08, 4.00),
  ('google', 'gemini-2.0-flash', 0.075, 0.0187, 0.30),
  ('google', 'gemini-2.5-pro', 1.25, 0.3125, 10.00)
ON CONFLICT (provider, model) DO UPDATE SET
  input_price_per_million = EXCLUDED.input_price_per_million,
  cached_input_price_per_million = EXCLUDED.cached_input_price_per_million,
  output_price_per_million = EXCLUDED.output_price_per_million,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS llm_events (
  ts TIMESTAMPTZ NOT NULL,
  org_id UUID NOT NULL,
  customer_id UUID,
  event_id UUID NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  feature TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  input_tokens_cached INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(12,8) NOT NULL DEFAULT 0,
  markup_usd NUMERIC(12,8) NOT NULL DEFAULT 0,
  budget_checked BOOLEAN NOT NULL DEFAULT FALSE,
  billing_emitted BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_llm_events_event_org ON llm_events (event_id, org_id);
CREATE INDEX IF NOT EXISTS idx_llm_events_org_ts ON llm_events (org_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_llm_events_org_customer_ts ON llm_events (org_id, customer_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_llm_events_metadata ON llm_events USING GIN (metadata);

CREATE MATERIALIZED VIEW IF NOT EXISTS cost_by_hour AS
SELECT
  date_trunc('hour', ts) AS bucket,
  org_id,
  customer_id,
  feature,
  model,
  provider,
  environment,
  SUM(cost_usd) AS total_cost,
  SUM(markup_usd) AS total_markup,
  SUM(input_tokens) AS total_input_tokens,
  SUM(input_tokens_cached) AS total_cached_tokens,
  SUM(output_tokens) AS total_output_tokens,
  COUNT(*) AS request_count,
  AVG(latency_ms) AS avg_latency_ms
FROM llm_events
GROUP BY date_trunc('hour', ts), org_id, customer_id, feature, model, provider, environment;

CREATE MATERIALIZED VIEW IF NOT EXISTS cost_by_day AS
SELECT
  date_trunc('day', ts) AS bucket,
  org_id,
  customer_id,
  feature,
  model,
  SUM(cost_usd) AS total_cost,
  SUM(markup_usd) AS total_markup,
  SUM(input_tokens + output_tokens) AS total_tokens,
  COUNT(*) AS request_count
FROM llm_events
GROUP BY date_trunc('day', ts), org_id, customer_id, feature, model;

CREATE TABLE IF NOT EXISTS stripe_meter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  customer_id UUID REFERENCES customers(id),
  llm_event_id UUID NOT NULL UNIQUE,
  stripe_event_id TEXT,
  amount_usd NUMERIC(12,4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  emitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stripe_meters_status ON stripe_meter_events (status, emitted_at)
  WHERE status IN ('pending', 'failed');

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_budget_configs_updated_at ON budget_configs;
CREATE TRIGGER trg_budget_configs_updated_at
  BEFORE UPDATE ON budget_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE VIEW customer_margin AS
SELECT
  e.org_id,
  e.customer_id,
  c.display_name,
  c.stripe_customer_id,
  date_trunc('month', e.bucket) AS month,
  SUM(e.total_cost) AS cost_usd,
  SUM(e.total_markup) AS markup_usd,
  SUM(e.total_cost + e.total_markup) AS billed_usd,
  CASE
    WHEN SUM(e.total_cost) = 0 THEN 0
    ELSE ROUND((SUM(e.total_markup) / SUM(e.total_cost)) * 100, 2)
  END AS margin_pct
FROM cost_by_day e
JOIN customers c ON c.id = e.customer_id
GROUP BY e.org_id, e.customer_id, c.display_name, c.stripe_customer_id, month;
`;

async function main() {
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await db.query(sql);
    console.log("core_schema_applied=true");
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error("core_schema_error");
  console.error(err.message);
  process.exit(1);
});
