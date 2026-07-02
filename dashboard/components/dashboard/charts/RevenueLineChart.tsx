"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactCurrency } from "@/lib/utils";
import { REVENUE_DATA as REVENUE_FALLBACK } from "@/lib/constants";

interface RevenueLineChartProps {
  data?: Array<{ month: string; revenue: number; cost: number; margin: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-meridian-bg-elevation border border-meridian-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-meridian-text-muted mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-meridian-text-secondary">{entry.name}</span>
          </div>
          <span className="text-meridian-text-primary font-medium">
            {entry.name === "Margin %"
              ? `${entry.value.toFixed(1)}%`
              : formatCompactCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const chartData = data ?? REVENUE_FALLBACK;

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-44 mb-2" />
          <div className="skeleton h-4 w-52" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-[280px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>Revenue vs Cost</CardTitle>
          <CardDescription>Monthly revenue, AI costs, and margin trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717A", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717A", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#A1A1AA" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", stroke: "#09090B", strokeWidth: 2 }}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#EF4444", stroke: "#09090B", strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Margin indicator */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-meridian-border">
            <span className="text-xs text-meridian-text-muted">Current Margin</span>
            <span className="text-sm font-semibold text-chart-green">
              {chartData[chartData.length - 1].margin.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
