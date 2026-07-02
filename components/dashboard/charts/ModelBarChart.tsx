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
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TOP_MODELS, type ModelData } from "@/lib/constants";
import { formatCompactCurrency } from "@/lib/utils";

const CHART_BAR_COLORS = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F97316", "#EC4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-meridian-bg-elevation border border-meridian-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-medium text-meridian-text-primary mb-1">{data.name}</p>
      <p className="text-xs text-meridian-text-muted mb-2">{data.provider}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-meridian-text-secondary">Cost</span>
          <span className="text-meridian-text-primary font-medium">{formatCompactCurrency(data.cost)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-meridian-text-secondary">Requests</span>
          <span className="text-meridian-text-primary font-medium">{(data.requests / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-meridian-text-secondary">Latency</span>
          <span className="text-meridian-text-primary font-medium">{data.latency}s</span>
        </div>
      </div>
    </div>
  );
};

interface ModelBarChartProps {
  data?: ModelData[];
}

export function ModelBarChart({ data }: ModelBarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-36 mb-2" />
          <div className="skeleton h-4 w-48" />
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
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>Top Models</CardTitle>
          <CardDescription>Cost by model for the current period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data ?? TOP_MODELS}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#71717A", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#A1A1AA", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="cost"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                >
                  {TOP_MODELS.map((_, index) => (
                    <Cell key={index} fill={CHART_BAR_COLORS[index % CHART_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
