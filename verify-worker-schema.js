require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

async function main() {
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const tables = [
      "model_pricing",
      "customers",
      "llm_events",
      "stripe_meter_events",
      "organizations",
      "api_keys"
    ];

    for (const t of tables) {
      const q = await db.query("SELECT to_regclass($1) AS name", [`public.${t}`]);
      console.log(`${t}=${q.rows[0].name ? "present" : "missing"}`);
    }

    const pricingCount = await db.query("SELECT COUNT(*)::int AS n FROM model_pricing");
    console.log(`model_pricing_rows=${pricingCount.rows[0].n}`);

    const sample = await db.query(
      "SELECT provider, model, input_price_per_million, output_price_per_million FROM model_pricing ORDER BY provider, model LIMIT 5"
    );
    console.log("model_pricing_sample=");
    for (const r of sample.rows) {
      console.log(`${r.provider}:${r.model} in=${r.input_price_per_million} out=${r.output_price_per_million}`);
    }
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error("verify_schema_error");
  console.error(err.message);
  process.exit(1);
});
