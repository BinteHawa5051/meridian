"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AI_COST_BREAKDOWN, type AiCostBreakdown } from "@/lib/constants";
import { formatCompactCurrency } from "@/lib/utils";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-meridian-bg-elevation border border-meridian-border rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-xs font-medium text-meridian-text-primary">{data.provider}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-meridian-text-secondary">Cost</span>
        <span className="text-meridian-text-primary font-medium">{formatCompactCurrency(data.cost)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-meridian-text-secondary">Share</span>
        <span className="text-meridian-text-primary font-medium">{data.percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

interface CostDonutChartProps {
  data?: AiCostBreakdown[];
}

export function CostDonutChart({ data }: CostDonutChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-4 w-36" />
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
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>AI Cost Breakdown</CardTitle>
          <CardDescription>Cost distribution by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data ?? AI_COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="cost"
                  nameKey="provider"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={1500}
                >
                  { (data ?? AI_COST_BREAKDOWN).map((entry, index) => (
                    <Cell
                      key={entry.provider}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                      stroke={activeIndex === index ? entry.color : "transparent"}
                      strokeWidth={activeIndex === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            { (data ?? AI_COST_BREAKDOWN).map((entry) => (
              <div key={entry.provider} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-meridian-text-secondary truncate">
                    {entry.provider}
                  </p>
                </div>
                <span className="text-xs text-meridian-text-primary tabular-nums">
                  {entry.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
