# Meridian — AI Cost Control Platform

> Set budgets that actually block calls. Meter usage your customers can audit. Bill them for it automatically.

Meridian is a full-stack AI cost control plane that sits between your application and LLM providers. It enforces spend limits in real-time, attributes costs per customer, and handles Stripe billing passthrough automatically.

---

## What it does

On every wrapped LLM call, Meridian:

1. **Checks the budget** (Redis, <2ms) — blocks or routes to fallback if cap is hit
2. **Calls the LLM** — original request, unmodified
3. **Computes cost** — tokens × live model pricing, cached tokens at discounted rate
4. **Decrements counters** — Redis INCRBYFLOAT, daily and monthly windows
5. **Emits a Stripe meter event** — customer billed automatically at month-end

---

## Screenshots

| Dashboard | Customers | Budgets |
|---|---|---|
| KPI cards, charts, heatmap | Profitability table, CSV export | Rules, usage bars, inline create |

---

## Stack

| Layer | Technology |
|---|---|
| Ingest API | Fastify (Node.js) — p99 <20ms |
| Queue | BullMQ + Redis |
| Worker | Node.js — cost compute, DB write, Stripe emit |
| Time-series DB | TimescaleDB via Neon |
| Cache | Redis via Upstash |
| Dashboard | Next.js 14 App Router + Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Email alerts | Resend |
| Billing | Stripe Meter Events |
| AI features | Anthropic Claude Haiku (anomaly detection) |
| Deploy | Vercel (dashboard) + Railway (backend) |

---

## Project Structure

```
meridian/
├── dashboard/                  # Next.js frontend (deploy to Vercel)
│   ├── app/                    # App Router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── customers/          # Customer profitability
│   │   ├── usage/              # Token & cost analytics
│   │   ├── models/             # Model usage + pricing
│   │   ├── budgets/            # Budget rules management
│   │   ├── alerts/             # Alert rules (email/slack/webhook)
│   │   ├── policies/           # Routing policies
│   │   ├── billing/            # Stripe meter events & revenue
│   │   ├── reports/            # Exportable CSV reports
│   │   ├── api-keys/           # Key creation & revocation
│   │   ├── integrations/       # Provider connections
│   │   ├── settings/           # Org & profile settings
│   │   └── api/meridian/       # Next.js API routes (DB-backed)
│   ├── components/             # UI components
│   ├── hooks/                  # TanStack Query hooks
│   ├── lib/                    # DB client, cache, utils, types
│   └── store/                  # Zustand state (sidebar, date range)
│
├── meridian-ingest-api.ts      # Fastify ingest service (port 3001)
├── meridian-worker.ts          # BullMQ worker — cost compute + Stripe
├── meridian-anomaly.ts         # Cron — AI-powered spend anomaly detection
├── meridian-sdk.ts             # Node.js SDK — wraps OpenAI client
├── meridian-schema.sql         # Full TimescaleDB schema + migrations
├── meridian-pricing-updater.ts # Cron — syncs model prices from OpenRouter
├── meridian-retention.ts       # Cron — per-plan data retention purge
├── meridian-stripe-retry.ts    # Cron — retries failed Stripe meter events
├── .env.example                # Environment variable template
└── README.md
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/BinteHawa5051/meridian.git
cd meridian
npm install
cd dashboard && npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your DATABASE_URL, REDIS_URL, STRIPE_SECRET_KEY etc.

cp .env.example dashboard/.env.local
# Same values — dashboard needs DATABASE_URL and REDIS_URL too
```

### 3. Run database migrations

```bash
# Connect to your Neon database and run:
psql $DATABASE_URL -f meridian-schema.sql
```

### 4. Start the dashboard

```bash
cd dashboard
npm run dev        # http://localhost:3000
```

### 5. Start the backend (optional — dashboard works with mock data without it)

```bash
# Terminal 1 — Ingest API
npx tsx meridian-ingest-api.ts

# Terminal 2 — Worker
npx tsx meridian-worker.ts
```

---

## Dashboard Pages

| Page | Path | Description |
|---|---|---|
| Dashboard | `/dashboard` | KPI cards, spend charts, customer table, live activity |
| Customers | `/customers` | Profitability table, search, filter, CSV export |
| Usage | `/usage` | Cost over time, requests, provider breakdown, heatmap |
| Models | `/models` | Usage by model + live pricing table |
| Budgets | `/budgets` | Budget rules, usage bars, create/manage |
| Alerts | `/alerts` | Alert rules — email, Slack, webhook, PagerDuty |
| Policies | `/policies` | Routing policies — fallback models on breach |
| Billing | `/billing` | Revenue chart, Stripe meter event audit trail |
| Reports | `/reports` | Download 5 CSV reports for any date range |
| API Keys | `/api-keys` | Create, display, revoke API keys |
| Integrations | `/integrations` | LLM provider + service connections |
| Settings | `/settings` | Org, profile, notifications, security |

---

## SDK Usage

```typescript
import { Meridian } from './meridian-sdk';
import OpenAI from 'openai';

// Wrap your existing OpenAI client — zero other changes needed
const ai = Meridian.wrap(new OpenAI(), {
  apiKey: process.env.MERIDIAN_API_KEY,
});

// Set a budget per customer
await ai.budgets.set({
  customerId:    'cus_acme',
  daily:         50.00,
  monthly:       500.00,
  onBreach:      'route',         // block | route | alert
  fallbackModel: 'gpt-4o-mini',
});

// Your existing code — unchanged
const res = await ai.chat.completions.create({
  model:    'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  user:     customerId,
});
```

---

## Deployment

### Dashboard → Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this repo
2. Set **Root Directory** to `dashboard`
3. Add environment variables: `DATABASE_URL`, `REDIS_URL`, `NODE_ENV=production`
4. Deploy

### Backend → Railway

1. Create a new Railway project
2. Add three services: `ingest-api`, `worker`, `anomaly-cron`
3. Set start commands:
   - Ingest API: `npx tsx meridian-ingest-api.ts`
   - Worker: `npx tsx meridian-worker.ts`
   - Anomaly cron: `npx tsx meridian-anomaly.ts` (schedule every 15 min)
4. Add all environment variables from `.env.example`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon / TimescaleDB connection string |
| `REDIS_URL` | ✅ | Upstash Redis connection string |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API key for meter events |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signature verification |
| `ANTHROPIC_API_KEY` | ✅ | Claude Haiku for anomaly triage |
| `RESEND_API_KEY` | ✅ | Transactional email for alerts |
| `PORT` | ➖ | Ingest API port (default: 3001) |
| `NEXT_PUBLIC_APP_URL` | ➖ | Your deployed Vercel URL |

---

## Cron Jobs

Schedule these on Railway or any cron service:

| Script | Schedule | Purpose |
|---|---|---|
| `meridian-anomaly.ts` | `*/15 * * * *` | AI spend anomaly detection |
| `meridian-pricing-updater.ts` | `0 2 * * 1` | Weekly model price sync |
| `meridian-retention.ts` | `0 3 * * *` | Nightly data retention purge |
| `meridian-stripe-retry.ts` | `*/15 * * * *` | Retry failed Stripe meter events |

---

## Infrastructure Cost (MVP)

| Service | Cost/month |
|---|---|
| Vercel (dashboard) | Free |
| Railway (3 backend services) | ~$20 |
| Neon Postgres + TimescaleDB | ~$19 |
| Upstash Redis | ~$10 |
| Resend email | Free (3K/mo) |
| **Total** | **~$49/mo** |

First paying customer at $99/mo covers 2× infrastructure.

---

## License

MIT
