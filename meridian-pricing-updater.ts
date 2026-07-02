/**
 * Meridian Pricing Updater — cron job (run weekly)
 * Fetches latest model pricing from OpenRouter and updates model_pricing table.
 *
 * Usage:  npx tsx meridian-pricing-updater.ts
 * Cron:   0 2 * * 1  (every Monday at 02:00)
 */

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = new Pool({ connectionString: process.env.DATABASE_URL! });

interface OpenRouterModel {
  id: string;
  pricing?: { prompt?: string; completion?: string; };
}

// Map OpenRouter model IDs → (provider, model) pairs we care about
const MODEL_MAP: Record<string, { provider: string; model: string }> = {
  "openai/gpt-4o":                      { provider: "openai",    model: "gpt-4o"                   },
  "openai/gpt-4o-mini":                 { provider: "openai",    model: "gpt-4o-mini"              },
  "openai/gpt-4.1":                     { provider: "openai",    model: "gpt-4.1"                  },
  "openai/o1":                          { provider: "openai",    model: "o1"                       },
  "openai/o4-mini":                     { provider: "openai",    model: "o4-mini"                  },
  "anthropic/claude-opus-4":            { provider: "anthropic", model: "claude-opus-4-6"          },
  "anthropic/claude-sonnet-4":          { provider: "anthropic", model: "claude-sonnet-4-6"        },
  "anthropic/claude-haiku-4-5":         { provider: "anthropic", model: "claude-haiku-4-5"         },
  "google/gemini-2.0-flash":            { provider: "google",    model: "gemini-2.0-flash"         },
  "google/gemini-2.5-pro":              { provider: "google",    model: "gemini-2.5-pro"           },
};

async function fetchOpenRouterPricing(): Promise<OpenRouterModel[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { "HTTP-Referer": "https://meridian.dev" },
  });
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
  const data = await res.json() as { data: OpenRouterModel[] };
  return data.data;
}

async function main() {
  console.info("Pricing updater started:", new Date().toISOString());

  let models: OpenRouterModel[];
  try {
    models = await fetchOpenRouterPricing();
    console.info(`Fetched ${models.length} models from OpenRouter`);
  } catch (err) {
    console.error("Failed to fetch OpenRouter pricing:", err);
    await db.end();
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const model of models) {
    const mapped = MODEL_MAP[model.id];
    if (!mapped) { skipped++; continue; }
    if (!model.pricing?.prompt || !model.pricing?.completion) { skipped++; continue; }

    // OpenRouter returns price per token — convert to per million
    const inputPerMillion  = parseFloat(model.pricing.prompt)     * 1_000_000;
    const outputPerMillion = parseFloat(model.pricing.completion) * 1_000_000;

    if (isNaN(inputPerMillion) || isNaN(outputPerMillion)) { skipped++; continue; }

    await db.query(`
      INSERT INTO model_pricing (provider, model, input_price_per_million, output_price_per_million, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (provider, model) DO UPDATE SET
        input_price_per_million  = EXCLUDED.input_price_per_million,
        output_price_per_million = EXCLUDED.output_price_per_million,
        updated_at               = NOW()
    `, [mapped.provider, mapped.model, inputPerMillion.toFixed(8), outputPerMillion.toFixed(8)]);

    console.info(`Updated ${mapped.provider}/${mapped.model}: $${inputPerMillion.toFixed(4)}/$${outputPerMillion.toFixed(4)} per 1M tokens`);
    updated++;
  }

  console.info(`Done. Updated: ${updated}, Skipped: ${skipped}`);
  await db.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  await db.end();
  process.exit(1);
});
