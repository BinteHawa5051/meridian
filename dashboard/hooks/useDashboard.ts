"use client";

import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { KpiData, SpendDataPoint, ModelData, AiCostBreakdown, CustomerProfitability, BudgetEnforcement, ActivityEntry, SystemService } from "@/lib/types";
import {
  generateKpiData, generateDashboardStats, generateSpendOverTime, generateAiCostBreakdown,
  generateTopModels, generateCustomerProfitability, generateBudgetEnforcements,
  generateActivityFeed, generateSystemServices, generateRevenueData,
  generateStackedBarData, generateHeatmapData,
} from "@/lib/mock-data";

export interface DashboardData {
  kpis:         KpiData[];
  stats:        ReturnType<typeof generateDashboardStats>;
  timeseries:   SpendDataPoint[];
  byProvider:   AiCostBreakdown[];
  byModel:      ModelData[];
  customers:    CustomerProfitability[];
  enforcements: BudgetEnforcement[];
  activities:   ActivityEntry[];
  heatmap:      Array<{ day: number; hour: number; value: number }>;
  stackedBar:   Array<{ day: string; OpenAI: number; Anthropic: number; Google: number; Mistral: number; Groq: number }>;
  revenue:      Array<{ month: string; revenue: number; cost: number; margin: number }>;
  generatedAt:  string;
}

function mockDashboard(): DashboardData {
  return {
    kpis:         generateKpiData(),
    stats:        generateDashboardStats(),
    timeseries:   generateSpendOverTime(),
    byProvider:   generateAiCostBreakdown(),
    byModel:      generateTopModels(),
    customers:    generateCustomerProfitability(),
    enforcements: generateBudgetEnforcements(),
    activities:   generateActivityFeed(),
    heatmap:      generateHeatmapData(),
    stackedBar:   generateStackedBarData(),
    revenue:      generateRevenueData(),
    generatedAt:  new Date().toISOString(),
  };
}

/** Single hook — replaces the 10 individual hooks on the dashboard page. */
export function useDashboard() {
  const range = useDashboardStore((s) => s.dateRange);

  return useQuery<DashboardData>({
    queryKey: ["meridian", "dashboard", range],
    queryFn:  async () => {
      const res = await fetch(`/api/meridian/dashboard?range=${range}`);
      if (!res.ok) throw new Error(`Dashboard API ${res.status}`);
      return res.json() as Promise<DashboardData>;
    },
    placeholderData: mockDashboard,
    staleTime:       30_000,
    retry:           2,
    retryDelay:      (n) => Math.min(500 * 2 ** n, 5_000),
  });
}
