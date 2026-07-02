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
  generateSpendOverTime,
  generateTopModels,
  generateCustomerData,
  generateBudgetAlerts,
  generateActivityFeed,
  generateSystemServices,
  generateAiCostBreakdown,
  generateCustomerProfitability,
  generateBudgetEnforcements,
  generateHeatmapData,
  generateRevenueData,
  generateStackedBarData,
} from "./mock-data";

// ─── Generated Data ─────────────────────────────────────
export const KPI_DATA: KpiData[] = generateKpiData();
export const SPEND_OVER_TIME: SpendDataPoint[] = generateSpendOverTime();
export const TOP_MODELS: ModelData[] = generateTopModels();
export const TOP_CUSTOMERS: CustomerData[] = generateCustomerData();
export const BUDGET_ALERTS: BudgetAlert[] = generateBudgetAlerts();
export const ACTIVITY_FEED: ActivityEntry[] = generateActivityFeed();
export const SYSTEM_SERVICES: SystemService[] = generateSystemServices();
export const AI_COST_BREAKDOWN: AiCostBreakdown[] = generateAiCostBreakdown();
export const CUSTOMER_PROFITABILITY: CustomerProfitability[] = generateCustomerProfitability();
export const BUDGET_ENFORCEMENTS: BudgetEnforcement[] = generateBudgetEnforcements();
export const HEATMAP_DATA = generateHeatmapData();
export const REVENUE_DATA = generateRevenueData();
export const STACKED_BAR_DATA = generateStackedBarData();

// ─── Re-export types for convenience ─────────────────────
export type {
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
};

// ─── Static Constants ────────────────────────────────────
export const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard" },
  { label: "Customers", icon: "Users", href: "/customers" },
  { label: "Usage", icon: "BarChart3", href: "/usage" },
  { label: "Models", icon: "Brain", href: "/models" },
  { label: "Budgets", icon: "Wallet", href: "/budgets" },
  { label: "Policies", icon: "Shield", href: "/policies" },
  { label: "Alerts", icon: "Bell", href: "/alerts" },
  { label: "Billing", icon: "CreditCard", href: "/billing" },
  { label: "API Keys", icon: "Key", href: "/api-keys" },
  { label: "Reports", icon: "FileText", href: "/reports" },
  { label: "Integrations", icon: "Puzzle", href: "/integrations" },
  { label: "Settings", icon: "Settings", href: "/settings" },
];

export const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F97316",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#EAB308",
];

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HOUR_LABELS = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);
