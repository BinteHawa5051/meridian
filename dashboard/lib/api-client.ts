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
import {
  generateKpiData,
  generateDashboardStats,
  generateSpendOverTime,
  generateAiCostBreakdown,
  generateTopModels,
  generateCustomerProfitability,
  generateCustomerData,
  generateBudgetEnforcements,
  generateBudgetAlerts,
  generateActivityFeed,
  generateSystemServices,
  generateRevenueData,
  generateStackedBarData,
  generateHeatmapData,
} from "./mock-data";

// ─── Types ──────────────────────────────────────────────

export interface SummaryResponse {
  kpis: KpiData[];
  stats: ReturnType<typeof generateDashboardStats>;
}

export interface TimeSeriesResponse {
  timeseries: SpendDataPoint[];
}

export interface BreakdownResponse {
  byProvider: AiCostBreakdown[];
  byModel: ModelData[];
}

export interface MarginResponse {
  customers: CustomerProfitability[];
}

export interface FullCustomer {
  id:               string;
  externalId:       string;
  name:             string;
  plan:             string;
  active:           boolean;
  stripeCustomerId: string | null;
  markup:           number;
  createdAt:        string;
  revenue:          number;
  aiCost:           number;
  profit:           number;
  margin:           number;
  requests:         number;
  status:           "active" | "at-risk" | "churned";
}

export interface CustomersResponse {
  customers: FullCustomer[];
}

export interface BudgetsResponse {
  enforcements: BudgetEnforcement[];
  alerts: BudgetAlert[];
}

export interface ActivityResponse {
  activities: ActivityEntry[];
}

export interface StatusResponse {
  services: SystemService[];
}

export interface ModelsResponse {
  models: ModelData[];
}

export interface RevenueResponse {
  revenue: Array<{ month: string; revenue: number; cost: number; margin: number }>;
}

export interface StackedBarResponse {
  stackedBar: Array<{ day: string; OpenAI: number; Anthropic: number; Google: number; Mistral: number; Groq: number }>;
}

export interface HeatmapResponse {
  heatmap: Array<{ day: number; hour: number; value: number }>;
}

// ─── API Base URL ───────────────────────────────────────

const API_BASE = "/api/meridian";

// ─── Fetch wrapper with timeout ─────────────────────────

async function fetchJson<T>(url: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── API Client ─────────────────────────────────────────

type DateRange = "7d" | "30d" | "90d" | "12m";

function withRange(path: string, range?: DateRange) {
  return range ? `${path}?range=${range}` : path;
}

export const meridianApi = {
  async getSummary(range?: DateRange): Promise<SummaryResponse> {
    return fetchJson<SummaryResponse>(withRange(`${API_BASE}/summary`, range));
  },

  async getTimeSeries(range?: DateRange): Promise<TimeSeriesResponse> {
    return fetchJson<TimeSeriesResponse>(withRange(`${API_BASE}/timeseries`, range));
  },

  async getBreakdown(range?: DateRange): Promise<BreakdownResponse> {
    return fetchJson<BreakdownResponse>(withRange(`${API_BASE}/breakdown`, range));
  },

  async getMargin(range?: DateRange): Promise<MarginResponse> {
    return fetchJson<MarginResponse>(withRange(`${API_BASE}/margin`, range));
  },

  async getCustomers(range?: DateRange, search?: string): Promise<CustomersResponse> {
    const params = new URLSearchParams();
    if (range)  params.set("range", range);
    if (search) params.set("search", search);
    const qs = params.toString();
    return fetchJson<CustomersResponse>(`${API_BASE}/customers${qs ? `?${qs}` : ""}`);
  },

  async getBudgets(range?: DateRange): Promise<BudgetsResponse> {
    return fetchJson<BudgetsResponse>(withRange(`${API_BASE}/budgets`, range));
  },

  async getActivity(): Promise<ActivityResponse> {
    return fetchJson<ActivityResponse>(`${API_BASE}/activity`);
  },

  async getStatus(): Promise<StatusResponse> {
    return fetchJson<StatusResponse>(`${API_BASE}/status`);
  },

  async getModels(range?: DateRange): Promise<ModelsResponse> {
    return fetchJson<ModelsResponse>(withRange(`${API_BASE}/models`, range));
  },

  async getRevenue(range?: DateRange): Promise<RevenueResponse> {
    return fetchJson<RevenueResponse>(withRange(`${API_BASE}/revenue`, range));
  },

  async getStackedBar(range?: DateRange): Promise<StackedBarResponse> {
    return fetchJson<StackedBarResponse>(withRange(`${API_BASE}/stacked-bar`, range));
  },

  async getHeatmap(range?: DateRange): Promise<HeatmapResponse> {
    return fetchJson<HeatmapResponse>(withRange(`${API_BASE}/heatmap`, range));
  },
};

// ─── Mock Fallback (when API is unavailable) ─────────────

export const mockFallback = {
  getSummary(): SummaryResponse {
    return { kpis: generateKpiData(), stats: generateDashboardStats() };
  },
  getTimeSeries(): TimeSeriesResponse {
    return { timeseries: generateSpendOverTime() };
  },
  getBreakdown(): BreakdownResponse {
    return { byProvider: generateAiCostBreakdown(), byModel: generateTopModels() };
  },
  getMargin(): MarginResponse {
    return { customers: generateCustomerProfitability() };
  },
  getCustomers(): CustomersResponse {
    return {
      customers: generateCustomerData().map((c, i) => ({
        id:               c.id,
        externalId:       c.id,
        name:             c.name,
        plan:             c.plan,
        active:           c.status !== "churned",
        stripeCustomerId: null,
        markup:           0.2,
        createdAt:        new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        revenue:          c.revenue,
        aiCost:           c.aiCost,
        profit:           c.profit,
        margin:           c.margin,
        requests:         Math.round(c.aiCost * 1000),
        status:           c.status,
      })),
    };
  },
  getBudgets(): BudgetsResponse {
    return { enforcements: generateBudgetEnforcements(), alerts: generateBudgetAlerts() };
  },
  getActivity(): ActivityResponse {
    return { activities: generateActivityFeed() };
  },
  getStatus(): StatusResponse {
    return { services: generateSystemServices() };
  },
  getModels(): ModelsResponse {
    return { models: generateTopModels() };
  },

  getRevenue(): RevenueResponse {
    return { revenue: generateRevenueData() };
  },

  getStackedBar(): StackedBarResponse {
    return { stackedBar: generateStackedBarData() };
  },

  getHeatmap(): HeatmapResponse {
    return { heatmap: generateHeatmapData() };
  },
};
