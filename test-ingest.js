const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.MERIDIAN_TEST_API_KEY;
  if (!apiKey) {
    throw new Error("MERIDIAN_TEST_API_KEY is required");
  }

  const payload = {
    events: [
      {
        eventId: crypto.randomUUID(),
        customerId: "cus_acme",
        provider: "openai",
        model: "gpt-4o-mini",
        inputTokens: 120,
        outputTokens: 40,
        metadata: { feature: "smoke-test" },
      },
    ],
  };

  const res = await fetch("http://127.0.0.1:3001/v1/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(JSON.stringify({ status: res.status, body: text }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
