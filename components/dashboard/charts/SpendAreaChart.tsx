"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SPEND_OVER_TIME, type SpendDataPoint } from "@/lib/constants";
import { formatCompactCurrency } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-meridian-bg-elevation border border-meridian-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-meridian-text-muted mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-meridian-text-secondary">{entry.name}:</span>
          <span className="text-meridian-text-primary font-medium">
            {formatCompactCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

interface SpendAreaChartProps {
  data?: SpendDataPoint[];
}

export function SpendAreaChart({ data }: SpendAreaChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-[320px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Spend Over Time</CardTitle>
              <CardDescription>
                Daily AI infrastructure costs across all providers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data ?? SPEND_OVER_TIME}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="openaiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anthropicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="googleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#71717A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717A", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  interval="preserveStartEnd"
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
                <Area
                  type="monotone"
                  dataKey="openai"
                  name="OpenAI"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#openaiGradient)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="anthropic"
                  name="Anthropic"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#anthropicGradient)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="google"
                  name="Google"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#googleGradient)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="other"
                  name="Other"
                  stroke="#71717A"
                  strokeWidth={2}
                  fill="url(#otherGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
