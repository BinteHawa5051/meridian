"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
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
import { STACKED_BAR_DATA as STACKED_BAR_FALLBACK } from "@/lib/constants";

interface StackedBarChartProps {
  data?: Array<{ day: string; OpenAI: number; Anthropic: number; Google: number; Mistral: number; Groq: number }>;
}

const colors: Record<string, string> = {
  OpenAI: "#3B82F6",
  Anthropic: "#8B5CF6",
  Google: "#10B981",
  Mistral: "#EC4899",
  Groq: "#F97316",
};

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
            {formatCompactCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function StackedBarChartComponent({ data }: StackedBarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const chartData = data ?? STACKED_BAR_FALLBACK;

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-40 mb-2" />
          <div className="skeleton h-4 w-44" />
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
      transition={{ delay: 0.45, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>Provider Breakdown</CardTitle>
          <CardDescription>Daily cost by provider (this week)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
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
                {Object.entries(colors).map(([key, color]) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={color}
                    radius={key === "Mistral" ? [0, 0, 0, 0] : [0, 0, 0, 0]}
                    animationDuration={1500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
