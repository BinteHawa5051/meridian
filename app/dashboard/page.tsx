"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { SpendAreaChart } from "@/components/dashboard/charts/SpendAreaChart";
import { ModelBarChart } from "@/components/dashboard/charts/ModelBarChart";
import { CostDonutChart } from "@/components/dashboard/charts/CostDonutChart";
import { RevenueLineChart } from "@/components/dashboard/charts/RevenueLineChart";
import { StackedBarChartComponent } from "@/components/dashboard/charts/StackedBarChart";
import { UsageHeatmap } from "@/components/dashboard/charts/UsageHeatmap";
import { CustomerProfitabilityTable } from "@/components/dashboard/customers/CustomerProfitabilityTable";
import { BudgetEnforcementCards } from "@/components/dashboard/budget/BudgetEnforcementCards";
import { LiveActivityFeed } from "@/components/dashboard/activity/LiveActivityFeed";
import { AiRoutingFlow } from "@/components/dashboard/routing/AiRoutingFlow";
import { AiCostBreakdownComponent } from "@/components/dashboard/breakdown/AiCostBreakdown";
import { SystemStatus } from "@/components/dashboard/status/SystemStatus";
import { useSystemStatus } from "@/hooks/useMeridianData";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  // ONE network request instead of 10
  const { data, isLoading } = useDashboard();

  // System status is independent (30s poll) — small separate call
  const { data: statusData } = useSystemStatus();

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  }, []);

  return (
    <Shell>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gradient mb-1">
          {isLoading ? "Loading…" : `${greeting}, Admin`}
        </h1>
        <p className="text-sm text-meridian-text-muted">
          {isLoading
            ? "Fetching your AI infrastructure data…"
            : "Here's what's happening across your AI infrastructure."}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="mb-8">
        <KpiCards data={data?.kpis} />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SpendAreaChart data={data?.timeseries} />
        <ModelBarChart  data={data?.byModel} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <CostDonutChart         data={data?.byProvider} />
        <RevenueLineChart       data={data?.revenue} />
        <StackedBarChartComponent data={data?.stackedBar} />
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <UsageHeatmap data={data?.heatmap} />
      </div>

      {/* Tables + budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CustomerProfitabilityTable data={data?.customers} />
        </div>
        <BudgetEnforcementCards data={data?.enforcements} />
      </div>

      {/* Activity + routing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <LiveActivityFeed data={data?.activities} />
        </div>
        <AiRoutingFlow />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiCostBreakdownComponent data={data?.byProvider} />
        <SystemStatus             data={statusData?.services} />
      </div>
    </Shell>
  );
}
