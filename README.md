# Meridian — AI Cost Control Platform

> Set budgets that actually block calls. Meter usage your customers can audit. Bill them for it automatically.

Meridian is a full-stack AI cost control plane. It sits between your application and LLM providers (OpenAI, Anthropic, Google), enforces spend limits in real-time, attributes costs per customer, and handles Stripe billing passthrough automatically.

---

## What it does

On every wrapped LLM call, Meridian:

1. **Checks the budget** (Redis, <2ms) — blocks or routes to a fallback model if the cap is hit
2. **Calls the LLM** — original request, unmodified
3. **Computes cost** — tokens × live model pricing, cached tokens at discounted rate
4. **Decrements counters** — Redis INCRBYFLOAT, daily and monthly windows
5. **Emits a Stripe meter event** — customer billed automatically at month-end

---

## Tech Stack

| Layer | Technology |
|---|---|
| Dashboard | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + Radix UI primitives |
| Charts | Recharts |
| Animations | Framer Motion |
| State | Zustand (UI) + TanStack Query (server) |
| Ingest API | Fastify (Node.js) — p99 <20ms |
| Queue | BullMQ + Redis |
| Worker | Node.js — cost compute, DB write, Stripe emit |
| Database | TimescaleDB via Neon (PostgreSQL) |
| Cache | Redis via Upstash |
| Email alerts | Resend |
| Billing | Stripe Meter Events |
| AI features | Anthropic Claude Haiku (anomaly detection) |
| Deploy | Vercel (dashboard) + Railway (backend) |

---

## Project Structure

```
meridian/
│
├── app/                            # Next.js App Router pages
│   ├── dashboard/                  # Main dashboard (KPIs, charts, activity)
│   ├── customers/                  # Customer profitability table
│   ├── usage/                      # Token & cost analytics
│   ├── models/                     # Model usage + pricing table
│   ├── budgets/                    # Budget rule management
│   ├── alerts/                     # Alert rules (email/Slack/webhook)
│   ├── policies/                   # Routing policies
│   ├── billing/                    # Stripe meter events & revenue
│   ├── reports/                    # Exportable CSV reports
│   ├── api-keys/                   # Key creation & revocation
│   ├── integrations/               # Provider connections
│   ├── settings/                   # Org & profile settings
│   └── api/meridian/               # Next.js API routes (DB-backed)
│       ├── dashboard/              # Combined dashboard data (1 request)
│       ├── summary/                # KPI cards
│       ├── timeseries/             # Daily spend by provider
│       ├── breakdown/              # Cost by model & provider
│       ├── margin/                 # Customer profitability
│       ├── customers/              # Customer list
│       ├── budgets/                # Budget rules + Redis counters
│       ├── activity/               # Recent events
│       ├── alerts/                 # Alert rules CRUD
│       ├── api-keys/               # Key management
│       ├── billing/                # Stripe meter events
│       ├── models/                 # Model usage
│       ├── pricing/                # Model pricing table
│       ├── revenue/                # Monthly revenue
│       ├── stacked-bar/            # Provider breakdown (weekly)
│       ├── heatmap/                # Request heatmap
│       └── status/                 # System health
│
├── components/
│   ├── layout/
│   │   ├── Shell.tsx               # Page wrapper (sidebar + topnav)
│   │   ├── Sidebar.tsx             # Collapsible navigation
│   │   └── TopNav.tsx              # Search, notifications, profile
│   ├── dashboard/
│   │   ├── KpiCards.tsx            # 6 animated metric cards
│   │   ├── charts/                 # Recharts wrappers
│   │   ├── customers/              # Profitability table
│   │   ├── budget/                 # Budget enforcement cards
│   │   ├── activity/               # Live activity feed
│   │   ├── breakdown/              # Cost breakdown panel
│   │   ├── routing/                # AI routing flow diagram
│   │   └── status/                 # System status indicators
│   └── ui/                         # Radix UI primitives (badge, button, card…)
│
├── hooks/
│   ├── useDashboard.ts             # Single hook — fetches all dashboard data
│   └── useMeridianData.ts          # Individual hooks per endpoint
│
├── lib/
│   ├── db.ts                       # PostgreSQL pool (singleton)
│   ├── cache.ts                    # In-process TTL cache for API routes
│   ├── api-client.ts               # Typed fetch wrappers + mock fallback
│   ├── mock-data.ts                # Deterministic seeded mock data
│   ├── types.ts                    # Shared TypeScript types
│   ├── constants.ts                # Sidebar items, chart colours
│   └── utils.ts                    # formatCurrency, cn, formatRelativeTime…
│
├── store/
│   └── useDashboardStore.ts        # Zustand — sidebar state + date range
│
├── meridian-ingest-api.ts          # Fastify ingest service (port 3001)
├── meridian-worker.ts              # BullMQ worker — cost compute + Stripe
├── meridian-anomaly.ts             # Cron — AI spend anomaly detection
├── meridian-sdk.ts                 # Node.js SDK — wraps OpenAI client
├── meridian-schema.sql             # Full TimescaleDB schema + migrations
├── meridian-pricing-updater.ts     # Cron — syncs model prices from OpenRouter
├── meridian-retention.ts           # Cron — per-plan data retention purge
├── meridian-stripe-retry.ts        # Cron — retries failed Stripe meter events
│
├── apply-schema-core.js            # Run DB migrations (setup script)
├── seed-auth.js                    # Create first org + API key
├── test-ingest.js                  # Smoke test for the ingest API
├── verify-worker-schema.js         # Verify DB tables exist
│
├── package.json                    # Dashboard + build dependencies
├── next.config.mjs                 # Next.js config
├── tailwind.config.ts              # Tailwind theme (meridian- colour tokens)
├── tsconfig.json                   # TypeScript config (@/ path alias)
├── vercel.json                     # Vercel deployment config
├── .env.example                    # Environment variable template
└── README.md
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/BinteHawa5051/meridian.git
cd meridian
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, REDIS_URL, STRIPE_SECRET_KEY etc.
```

### 3. Run database migrations

```bash
node apply-schema-core.js
```

### 4. Seed first org and API key

```bash
node seed-auth.js
# Prints your orgId and API key
```

### 5. Start the dashboard

```bash
npm run dev        # http://localhost:3000
```

### 6. Start the backend (optional)

```bash
# Terminal 1 — Ingest API
npx tsx meridian-ingest-api.ts

# Terminal 2 — Worker
npx tsx meridian-worker.ts
```

---

## Dashboard Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | KPI cards, spend charts, heatmap, activity feed |
| Customers | `/customers` | Profitability table, search, filter, CSV export |
| Usage | `/usage` | Cost over time, requests, provider breakdown, heatmap |
| Models | `/models` | Usage by model + live pricing table |
| Budgets | `/budgets` | Budget rules, usage bars, inline create form |
| Alerts | `/alerts` | Alert rules — email, Slack, webhook, PagerDuty |
| Policies | `/policies` | Model routing policies on budget/latency breach |
| Billing | `/billing` | Revenue chart, Stripe meter event audit trail |
| Reports | `/reports` | Download 5 CSV reports for any date range |
| API Keys | `/api-keys` | Create, display prefix, revoke keys |
| Integrations | `/integrations` | LLM provider + service connections |
| Settings | `/settings` | Org, profile, notifications, security |

---

## SDK Usage

```typescript
import { Meridian } from './meridian-sdk';
import OpenAI from 'openai';

// Wrap your existing OpenAI client — one line change
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

// Your existing code unchanged
const res = await ai.chat.completions.create({
  model:    'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  user:     customerId,
});
```

---

## Deployment

### Dashboard → Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import `BinteHawa5051/meridian`
2. **Root Directory** — leave blank
3. **Node.js Version** — 20.x
4. Add environment variables (see below)
5. Deploy

### Backend → Railway

Create 3 services with these start commands:

| Service | Command |
|---|---|
| Ingest API | `npx tsx meridian-ingest-api.ts` |
| Worker | `npx tsx meridian-worker.ts` |
| Anomaly Cron | `npx tsx meridian-anomaly.ts` |

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

| Script | Schedule | Purpose |
|---|---|---|
| `meridian-anomaly.ts` | `*/15 * * * *` | AI-powered spend anomaly detection |
| `meridian-pricing-updater.ts` | `0 2 * * 1` | Weekly model price sync from OpenRouter |
| `meridian-retention.ts` | `0 3 * * *` | Nightly data retention purge per plan |
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

---

## License

MIT
