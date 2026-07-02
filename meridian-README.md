# Meridian

**The AI cost control plane.**  
Set budgets that actually block calls. Meter usage your customers can audit. Bill them for it automatically.

Not another observability dashboard — the enforcement and billing layer that Helicone, Langfuse, and LiteLLM explicitly refuse to build.

---

## What it does

On every wrapped LLM call, Meridian:

1. **Checks the budget** (Redis, <2ms) — rejects or routes if the cap is hit
2. **Calls the LLM** — original call, unmodified, unless routing
3. **Computes cost** — tokens × live model price, cached tokens at discounted rate
4. **Decrements the counter** — Redis INCRBYFLOAT, daily and monthly windows
5. **Emits a Stripe meter event** — customer billed automatically at month-end

## Quick start

```bash
npm install meridian-ai
```

```typescript
import { Meridian } from 'meridian-ai';
import OpenAI from 'openai';

// 1. Wrap your existing client — zero other changes
const ai = Meridian.wrap(new OpenAI(), {
  apiKey: process.env.MERIDIAN_API_KEY,
});

// 2. Set a budget per customer (once, at signup)
await ai.budgets.set({
  customerId:    'cus_acme',
  daily:         50.00,
  monthly:       500.00,
  onBreach:      'route',           // block | route | alert
  fallbackModel: 'gpt-4o-mini',
});

// 3. Your existing code — unchanged
const res = await ai.chat.completions.create({
  model:    'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  user:     customerId,
  metadata: { feature: 'summarize' },
});
```

## Project structure

```
meridian/
├── sdk/               # Node.js + Python SDKs (npm: meridian-ai)
│   └── src/
│       └── index.ts   # Meridian.wrap(), BudgetManager, EventBuffer
├── api/               # Ingest API + Analytics API (Fastify)
│   └── src/
│       ├── server.ts  # POST /v1/ingest — p99 <20ms, returns 202 immediately
│       └── routes/
│           ├── budgets.ts     # GET /v1/budgets/:id/check (hot path)
│           └── analytics.ts   # Dashboard query endpoints
├── worker/            # BullMQ consumers
│   └── src/
│       ├── worker.ts           # Cost compute + DB write + Stripe emit
│       └── anomaly-detection.ts # AI-powered spend spike detector (cron)
├── dashboard/         # Next.js App Router + Clerk auth
├── migrations/
│   └── 001_initial_schema.sql  # Full TimescaleDB schema
├── .env.example       # All required environment variables
├── .github/
│   └── workflows/ci.yml        # Lint → test → Railway deploy
└── package.json       # npm workspaces monorepo
```

## Architecture

```
SDK call
  │
  ├─ Budget check (Redis, <2ms)
  │   ├─ Over limit → BudgetExceededError (block) or fallback model (route)
  │   └─ Under limit → proceed
  │
  ├─ LLM call (OpenAI / Anthropic / Google)
  │
  ├─ EventBuffer.push() → async, never blocks response
  │
  └─ Worker (BullMQ)
      ├─ Dedup via event_id UNIQUE constraint
      ├─ Compute cost_usd from pricing table
      ├─ INSERT INTO llm_events (TimescaleDB hypertable)
      ├─ INCRBYFLOAT budget counters (Redis)
      └─ Stripe meter event → customer invoice
```

## Stack

| Layer       | Technology                        | Why                                         |
|-------------|-----------------------------------|---------------------------------------------|
| Ingest API  | Fastify (Node.js)                 | Fastest Node HTTP framework, schema validation |
| Queue       | BullMQ + Redis                    | At-least-once delivery, retry, DLQ          |
| Worker      | Node.js                           | Same runtime as SDK — easy to reason about  |
| Time-series | TimescaleDB (via Neon)            | PostgreSQL-compatible, continuous aggregates |
| Relational  | PostgreSQL (Neon)                 | Same Neon instance as TimescaleDB           |
| Cache       | Redis (Upstash)                   | Budget counters, API key cache              |
| Dashboard   | Next.js + Clerk                   | RSC for fast data, Clerk for zero-auth-code |
| Email       | Resend                            | Best DX, 3K free/month                     |
| Billing     | Stripe (meter events)             | Industry standard, audit-ready              |
| Deploy      | Railway                           | 3 services, auto-deploy from GitHub         |
| AI features | Anthropic claude-haiku-4-5              | Cheapest capable model for automated tasks  |

## Infrastructure cost at MVP scale

| Service         | Cost/month   |
|-----------------|--------------|
| Railway (3 svcs) | ~$20         |
| Neon Postgres   | ~$19         |
| Upstash Redis   | ~$10         |
| Resend          | Free (3K/mo) |
| **Total**       | **~$50**     |

First paying customer ($99/mo Scale plan) covers 2× infrastructure.

## Development

```bash
# 1. Clone and install
git clone https://github.com/your-org/meridian
cd meridian && npm install

# 2. Copy and fill environment variables
cp .env.example .env.local

# 3. Run migrations
npm run migrate

# 4. Start all services
npm run dev:api       # :3001
npm run dev:worker    # background queue consumer
npm run dev:dashboard # :3000
```

## License

MIT
