export interface KpiData {
  label: string;
  value: number;
  previousValue: number;
  format: "currency" | "number" | "percentage";
  icon: string;
  sparklineData: { value: number }[];
}

export interface SpendDataPoint {
  date: string;
  openai: number;
  anthropic: number;
  google: number;
  groq?: number;
  mistral?: number;
  other: number;
  total: number;
}

export interface ModelData {
  name: string;
  provider: string;
  cost: number;
  requests: number;
  tokens: number;
  latency: number;
  percentage: number;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  revenue: number;
  aiCost: number;
  profit: number;
  margin: number;
  status: "active" | "at-risk" | "churned";
  plan: "enterprise" | "scale" | "starter";
}

export interface BudgetAlert {
  id: string;
  customer: string;
  type: "blocked" | "downgraded" | "exceeded" | "warning" | "auto-switch";
  model: string;
  budget: number;
  spent: number;
  timestamp: Date;
}

export interface ActivityEntry {
  id: string;
  type: "budget-exceeded" | "model-switch" | "invoice" | "policy" | "api-key";
  description: string;
  customer?: string;
  timestamp: Date;
  severity: "info" | "warning" | "critical" | "success";
}

export interface SystemService {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  uptime: number;
}

export interface AiCostBreakdown {
  provider: string;
  cost: number;
  percentage: number;
  color: string;
}

export interface CustomerProfitability {
  customer: string;
  revenue: number;
  aiCost: number;
  profit: number;
  margin: number;
}

export interface BudgetEnforcement {
  id: string;
  customer: string;
  action: "blocked" | "downgraded" | "warning" | "auto-switch";
  model: string;
  fallback: string | null;
  budget: number;
  spent: number;
  severity: "critical" | "warning" | "info";
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
