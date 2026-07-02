export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query<{
      provider: string; model: string;
      input_price_per_million: string;
      cached_input_price_per_million: string;
      output_price_per_million: string;
      active: boolean; updated_at: string;
    }>(`
      SELECT provider, model,
             input_price_per_million,
             cached_input_price_per_million,
             output_price_per_million,
             active, updated_at
      FROM model_pricing
      ORDER BY provider, model
    `);

    const pricing = rows.map((r) => ({
      provider:                    r.provider,
      model:                       r.model,
      inputPricePerMillion:        parseFloat(r.input_price_per_million),
      cachedInputPricePerMillion:  parseFloat(r.cached_input_price_per_million),
      outputPricePerMillion:       parseFloat(r.output_price_per_million),
      active:                      r.active,
      updatedAt:                   r.updated_at,
    }));

    return NextResponse.json({ pricing });
  } catch (err) {
    console.error("[/api/meridian/pricing] error:", err);
    return NextResponse.json({ pricing: [] });
  }
}
