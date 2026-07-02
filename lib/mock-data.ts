import type {
  KpiData,
  SpendDataPoint,
  ModelData,
  CustomerData,
  BudgetAlert,
  ActivityEntry,
  SystemService,
  AiCostBreakdown,
  CustomerProfitability,
  BudgetEnforcement,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────
// Deterministic seeded PRNG using mutable state.
// Each generator function resets the seed so every call produces identical data.
let _rngState = 42;
function _nextRandom(): number {
  _rngState = (_rngState * 16807) % 2147483647;
  return (_rngState - 1) / 2147483646;
}

const random = (min: number, max: number) => _nextRandom() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));

/** Reset PRNG so the next call to a generator produces deterministic data. */
function resetRng() {
  _rngState = 42;
}

function smoothRandom(i: number, seed = 42) {
  return Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 3.2 + seed * 2) * 0.3 + 0.5;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── KPI Cards ──────────────────────────────────────────
export function generateKpiData(): KpiData[] {
  resetRng();
  const baseSpend = 284530;
  const growth = 1.12;

  return [
    {
      label: "Total AI Spend",
      value: baseSpend,
      previousValue: Math.round(baseSpend / growth),
      format: "currency",
      icon: "DollarSign",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: Math.round(
          8000 + (i / 29) * 3000 + smoothRandom(i, 1) * 2000 + random(0, 1000)
        ),
      })),
    },
    {
      label: "Revenue",
      value: 412800,
      previousValue: 358000,
      format: "currency",
      icon: "TrendingUp",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: Math.round(
          12000 + (i / 29) * 4000 + smoothRandom(i, 5) * 2500 + random(0, 1500)
        ),
      })),
    },
    {
      label: "Profit Margin",
      value: 34.7,
      previousValue: 31.2,
      format: "percentage",
      icon: "PieChart",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: clamp(28 + (i / 29) * 6 + smoothRandom(i, 10) * 3 + random(0, 2), 25, 40),
      })),
    },
    {
      label: "Active Customers",
      value: 127,
      previousValue: 112,
      format: "number",
      icon: "Users",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: Math.round(100 + (i / 29) * 20 + smoothRandom(i, 15) * 5 + random(0, 3)),
      })),
    },
    {
      label: "LLM Requests",
      value: 8450000,
      previousValue: 6900000,
      format: "number",
      icon: "MessageSquare",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: Math.round(
          220000 + (i / 29) * 100000 + smoothRandom(i, 20) * 60000 + random(0, 30000)
        ),
      })),
    },
    {
      label: "Budget Usage",
      value: 72.4,
      previousValue: 65.8,
      format: "percentage",
      icon: "Gauge",
      sparklineData: Array.from({ length: 30 }, (_, i) => ({
        value: clamp(55 + (i / 29) * 15 + smoothRandom(i, 25) * 8 + random(0, 4), 50, 85),
      })),
    },
  ];
}

// ─── Spend Over Time ─────────────────────────────────────
export function generateSpendOverTime(): SpendDataPoint[] {
  resetRng();
  const days = 60;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const weekendFactor = isWeekend ? 0.5 : 1;
    const growthTrend = 1 + (i / days) * 0.25;
    const weeklyPattern = 1 + Math.sin((i / 7) * Math.PI * 2) * 0.08;
    const noise = 1 + random(-0.075, 0.075);

    const openai = Math.round(8500 * weekendFactor * growthTrend * weeklyPattern * noise);
    const anthropic = Math.round(4200 * weekendFactor * growthTrend * weeklyPattern * noise);
    const google = Math.round(1600 * weekendFactor * growthTrend * weeklyPattern * noise);
    const groq = Math.round(800 * weekendFactor * growthTrend * weeklyPattern * noise);
    const mistral = Math.round(600 * weekendFactor * growthTrend * weeklyPattern * noise);
    const other = Math.round(800 * weekendFactor * growthTrend * weeklyPattern * noise);

    return {
      date: dateStr,
      openai,
      anthropic,
      google,
      groq,
      mistral,
      other,
      total: openai + anthropic + google + groq + mistral + other,
    };
  });
}

// ─── Models ──────────────────────────────────────────────
export function generateTopModels(): ModelData[] {
  return [
    { name: "GPT-4o", provider: "OpenAI", cost: 89200, requests: 2100000, tokens: 420000000, latency: 1.2, percentage: 28.4 },
    { name: "Claude 3.5 Sonnet", provider: "Anthropic", cost: 65400, requests: 980000, tokens: 280000000, latency: 1.8, percentage: 20.8 },
    { name: "GPT-4o Mini", provider: "OpenAI", cost: 42100, requests: 4200000, tokens: 680000000, latency: 0.6, percentage: 13.4 },
    { name: "Gemini 1.5 Pro", provider: "Google", cost: 27800, requests: 720000, tokens: 210000000, latency: 1.5, percentage: 8.9 },
    { name: "Claude 3 Haiku", provider: "Anthropic", cost: 18400, requests: 2500000, tokens: 320000000, latency: 0.4, percentage: 5.9 },
    { name: "Mistral Large", provider: "Mistral", cost: 12900, requests: 340000, tokens: 120000000, latency: 1.1, percentage: 4.1 },
    { name: "Gemini 1.5 Flash", provider: "Google", cost: 9800, requests: 1800000, tokens: 240000000, latency: 0.5, percentage: 3.1 },
    { name: "Groq Mixtral", provider: "Groq", cost: 7600, requests: 890000, tokens: 98000000, latency: 0.3, percentage: 2.4 },
    { name: "GPT-4 Turbo", provider: "OpenAI", cost: 5400, requests: 120000, tokens: 45000000, latency: 1.4, percentage: 1.7 },
    { name: "Claude Opus", provider: "Anthropic", cost: 3200, requests: 45000, tokens: 18000000, latency: 2.4, percentage: 1.0 },
  ];
}

// ─── Customers ───────────────────────────────────────────
const CUSTOMER_DATA: { name: string; email: string; plan: "enterprise" | "scale" | "starter" }[] = [
  { name: "Acme Corp", email: "admin@acme.com", plan: "enterprise" },
  { name: "TechFlow Inc", email: "ops@techflow.io", plan: "scale" },
  { name: "DataSync Labs", email: "hello@datasync.dev", plan: "scale" },
  { name: "NovaSoft", email: "team@novasoft.com", plan: "starter" },
  { name: "CloudPeak", email: "dev@cloudpeak.io", plan: "starter" },
  { name: "Quantum Labs", email: "info@quantum.dev", plan: "starter" },
  { name: "Stellar AI", email: "eng@stellar-ai.com", plan: "enterprise" },
  { name: "NeuralPath", email: "contact@neuralpath.co", plan: "scale" },
  { name: "Phoenix Analytics", email: "support@phoenix.ly", plan: "scale" },
  { name: "Atlas AI", email: "team@atlasai.com", plan: "enterprise" },
  { name: "Cortex Health", email: "it@cortex.health", plan: "starter" },
  { name: "DeepField", email: "ops@deepfield.dev", plan: "scale" },
];

const planMultiplier = { enterprise: 1.0, scale: 0.65, starter: 0.3 };

export function generateCustomerData(): CustomerData[] {
  return CUSTOMER_DATA.map((c, i) => {
    const baseRevenue = Math.round(30000 + smoothRandom(i * 7, 100) * 70000);
    const planFactor = planMultiplier[c.plan];
    const revenue = Math.round(baseRevenue * planFactor);
    const aiCost = Math.round(
      revenue * (0.15 + smoothRandom(i * 13, 200) * 0.5) +
        (c.plan === "enterprise" ? 5000 : c.plan === "scale" ? 2000 : 500)
    );
    const profit = revenue - aiCost;
    const margin = (profit / revenue) * 100;

    let status: "active" | "at-risk" | "churned";
    if (margin < -10) status = "churned";
    else if (margin < 15) status = "at-risk";
    else status = "active";

    return {
      id: `cus_${String(i + 1).padStart(3, "0")}`,
      name: c.name,
      email: c.email,
      revenue,
      aiCost,
      profit,
      margin: Math.round(margin * 10) / 10,
      status,
      plan: c.plan,
    };
  });
}

// ─── Budget Alerts ───────────────────────────────────────
const BUDGET_ACTIONS = ["blocked", "downgraded", "exceeded", "warning", "auto-switch"] as const;
const MODELS = ["GPT-4o", "Claude 3.5 Sonnet", "GPT-4o Mini", "Gemini 1.5 Pro", "Claude 3 Haiku", "Mistral Large"];

export function generateBudgetAlerts(): BudgetAlert[] {
  resetRng();
  const customers = CUSTOMER_DATA.slice(0, 8);
  return customers.map((c, i) => {
    const action = BUDGET_ACTIONS[i % BUDGET_ACTIONS.length];
    const model = MODELS[i % MODELS.length];
    const budget = Math.round(20000 + smoothRandom(i * 11, 300) * 50000);
    const spentPercent = 0.85 + smoothRandom(i * 17, 400) * 0.2;
    const spent = Math.round(budget * Math.min(spentPercent, 1.15));

    return {
      id: `ba_${String(i + 1).padStart(3, "0")}`,
      customer: c.name,
      type: action,
      model,
      budget,
      spent: Math.min(spent, Math.round(budget * 1.2)),
      timestamp: new Date(Date.now() - random(30 * 60 * 1000, 48 * 60 * 60 * 1000)),
    };
  });
}

// ─── Activity Feed ───────────────────────────────────────
const ACTIVITY_TYPES = ["budget-exceeded", "model-switch", "invoice", "policy", "api-key"] as const;
const ACTIVITY_TEMPLATES = [
  { type: "budget-exceeded" as const, template: (c: string) => `${c} exceeded monthly budget for ${MODELS[randomInt(0, MODELS.length - 1)]}`, severity: "critical" as const },
  { type: "model-switch" as const, template: (c: string) => `Auto-switched ${c} from ${MODELS[randomInt(0, 2)]} to ${MODELS[randomInt(3, 5)]}`, severity: "warning" as const },
  { type: "invoice" as const, template: (c: string) => `Invoice #INV-${String(randomInt(100, 999))} generated for ${c} — $${(random(1, 15) * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, severity: "success" as const },
  { type: "policy" as const, template: (c: string) => `Budget policy triggered for ${c} — ${randomInt(85, 99)}% usage on ${MODELS[randomInt(0, 3)]}`, severity: "warning" as const },
  { type: "api-key" as const, template: (c: string) => `New API key created for ${c} — ${["production", "staging", "development"][randomInt(0, 2)]} environment`, severity: "info" as const },
  { type: "budget-exceeded" as const, template: (c: string) => `${c} blocked — exceeded ${["$10K", "$25K", "$50K", "$100K"][randomInt(0, 3)]} monthly cap`, severity: "critical" as const },
  { type: "model-switch" as const, template: () => `GPT-4o Mini routed to ${MODELS[randomInt(3, 5)]} for starter plan requests`, severity: "info" as const },
  { type: "invoice" as const, template: () => `Stripe meter event batch emitted — ${(random(1, 10) * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} events`, severity: "success" as const },
  { type: "policy" as const, template: () => `New routing policy applied — redirect ${MODELS[randomInt(0, 2)]} traffic to ${MODELS[randomInt(3, 5)]} during peak hours`, severity: "info" as const },
  { type: "api-key" as const, template: (c: string) => `${c} rotated API key — previous key revoked`, severity: "warning" as const },
];

export function generateActivityFeed(): ActivityEntry[] {
  resetRng();
  return ACTIVITY_TEMPLATES.map((t, i) => {
    const customer = CUSTOMER_DATA[i % CUSTOMER_DATA.length];
    const minutesAgo = random(i * 15 * 60, (i + 1) * 25 * 60);
    return {
      id: `act_${String(i + 1).padStart(3, "0")}`,
      type: t.type,
      description: t.template(customer.name),
      customer: t.template.toString().includes("c: string") ? customer.name : undefined,
      timestamp: new Date(Date.now() - minutesAgo * 1000),
      severity: t.severity,
    };
  });
}

// ─── System Services ─────────────────────────────────────
export function generateSystemServices(): SystemService[] {
  return [
    { name: "Redis", status: "operational", latency: 1.2, uptime: 99.99 },
    { name: "Postgres", status: "operational", latency: 3.8, uptime: 99.97 },
    { name: "Queue", status: "operational", latency: 2.1, uptime: 99.95 },
    { name: "Workers", status: "operational", latency: 4.5, uptime: 99.92 },
    { name: "Stripe", status: "operational", latency: 124, uptime: 99.99 },
    { name: "API", status: "operational", latency: 18, uptime: 99.88 },
    { name: "CDN", status: "operational", latency: 8.3, uptime: 99.96 },
    { name: "Auth0", status: "degraded", latency: 245, uptime: 98.72 },
  ];
}

// ─── AI Cost Breakdown ───────────────────────────────────
export function generateAiCostBreakdown(): AiCostBreakdown[] {
  return [
    { provider: "OpenAI", cost: 121300, percentage: 38.6, color: "#3B82F6" },
    { provider: "Anthropic", cost: 83800, percentage: 26.7, color: "#8B5CF6" },
    { provider: "Google", cost: 37600, percentage: 12.0, color: "#10B981" },
    { provider: "Groq", cost: 7600, percentage: 2.4, color: "#F97316" },
    { provider: "Mistral", cost: 12900, percentage: 4.1, color: "#EC4899" },
    { provider: "OpenRouter", cost: 5800, percentage: 1.8, color: "#06B6D4" },
    { provider: "Other", cost: 45000, percentage: 14.4, color: "#71717A" },
  ];
}

// ─── Customer Profitability ──────────────────────────────
export function generateCustomerProfitability(): CustomerProfitability[] {
  return generateCustomerData().map((c) => ({
    customer: c.name,
    revenue: c.revenue,
    aiCost: c.aiCost,
    profit: c.profit,
    margin: c.margin,
  }));
}

// ─── Budget Enforcements ─────────────────────────────────
export function generateBudgetEnforcements(): BudgetEnforcement[] {
  const actions: BudgetEnforcement["action"][] = ["blocked", "downgraded", "warning", "auto-switch"];
  return CUSTOMER_DATA.slice(0, 8).map((c, i) => {
    const action = actions[i % actions.length];
    const model = MODELS[i % MODELS.length];
    const budget = Math.round(25000 + smoothRandom(i * 23, 500) * 45000);
    const spentPct = action === "blocked" ? 1.12 : action === "downgraded" ? 1.05 : action === "warning" ? 0.97 : 0.92;
    const spent = Math.round(budget * spentPct);

    return {
      id: `be_${String(i + 1).padStart(3, "0")}`,
      customer: c.name,
      action,
      model,
      fallback: action === "downgraded" || action === "auto-switch" ? MODELS[(i + 3) % MODELS.length] : null,
      budget,
      spent,
      severity: spent >= budget ? "critical" : spent >= budget * 0.9 ? "warning" : "info",
    };
  });
}

// ─── Heatmap Data ────────────────────────────────────────
export function generateHeatmapData() {
  resetRng();
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const isWeekend = day >= 5;
      const isBusinessHour = hour >= 9 && hour <= 17;
      const isLateNight = hour <= 6 || hour >= 23;

      let baseValue: number;
      if (isWeekend) {
        baseValue = isBusinessHour ? 35 : isLateNight ? 5 : 18;
      } else {
        baseValue = isBusinessHour ? 85 : isLateNight ? 8 : 30;
      }

      if (hour >= 12 && hour <= 13 && !isWeekend) baseValue *= 0.7;
      if (hour >= 10 && hour <= 11) baseValue *= 1.15;

      return {
        day,
        hour,
        value: Math.round(clamp(baseValue + random(-baseValue * 0.2, baseValue * 0.2), 1, 100)),
      };
    })
  ).flat();
}

// ─── Revenue Data ────────────────────────────────────────
export function generateRevenueData() {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, i, 1).toLocaleString("default", { month: "short" });
    const growth = 1 + (i / 11) * 0.35;
    const seasonal = 1 + Math.sin((i / 12) * Math.PI * 2 - 0.5) * 0.08;
    const revenue = Math.round((32000 + i * 4000 + smoothRandom(i * 3, 50) * 8000) * growth * seasonal);
    const cost = Math.round((18000 + i * 2500 + smoothRandom(i * 7, 100) * 5000) * growth * seasonal);
    return {
      month,
      revenue,
      cost,
      margin: Math.round(((revenue - cost) / revenue) * 1000) / 10,
    };
  });
}

// ─── Stacked Bar Data ────────────────────────────────────
export function generateStackedBarData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => {
    const isWeekend = i >= 5;
    const factor = isWeekend ? 0.45 : 1;
    return {
      day,
      OpenAI: Math.round((8000 + smoothRandom(i * 2, 30) * 3000) * factor),
      Anthropic: Math.round((4200 + smoothRandom(i * 5, 60) * 1500) * factor),
      Google: Math.round((1600 + smoothRandom(i * 8, 90) * 800) * factor),
      Mistral: Math.round((600 + smoothRandom(i * 11, 120) * 300) * factor),
      Groq: Math.round((400 + smoothRandom(i * 14, 150) * 200) * factor),
    };
  });
}

// ─── Dashboard Stats ─────────────────────────────────────
export function generateDashboardStats() {
  return {
    totalCustomers: 127,
    activeCustomers: 118,
    churnedCustomers: 9,
    totalRevenue: 412800,
    totalAiCost: 284530,
    averageMargin: 34.7,
    monthlyRequestVolume: 8450000,
    activeModels: 14,
    providersIntegrated: 7,
    budgetUtilization: 72.4,
    alertsActive: 4,
    policiesActive: 12,
  };
}
