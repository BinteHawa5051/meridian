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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_COST_BREAKDOWN, type AiCostBreakdown } from "@/lib/constants";
import { formatCompactCurrency } from "@/lib/utils";
import { Globe, BarChart3, Trello } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
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

interface AiCostBreakdownComponentProps {
  data?: AiCostBreakdown[];
}

export function AiCostBreakdownComponent({ data }: AiCostBreakdownComponentProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-40 mb-2" />
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
      transition={{ delay: 0.75, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>Cost per Provider</CardTitle>
          <CardDescription>
            AI spend distribution across all providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="treemap">
            <TabsList className="mb-4">
              <TabsTrigger value="treemap" className="text-xs gap-1.5">
                <Trello className="w-3.5 h-3.5" />
                Treemap
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Bar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="treemap">
              <div className="grid grid-cols-2 gap-2">
                {(data ?? AI_COST_BREAKDOWN).map((provider, i) => (
                  <motion.div
                    key={provider.provider}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    style={{
                      backgroundColor: `${provider.color}08`,
                      borderColor: `${provider.color}20`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: `${provider.color}15` }}
                      >
                        <Globe className="w-3.5 h-3.5" style={{ color: provider.color }} />
                      </div>
                      <span
                        className="text-xs font-semibold tabular-nums"
                        style={{ color: provider.color }}
                      >
                        {provider.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-meridian-text-primary">
                      {provider.provider}
                    </p>
                    <p className="text-xs text-meridian-text-muted">
                      {formatCompactCurrency(provider.cost)}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${provider.color}15` }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${provider.percentage * 2}%`,
                          backgroundColor: provider.color,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bar">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data ?? AI_COST_BREAKDOWN}
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
                      dataKey="provider"
                      tick={{ fill: "#A1A1AA", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="cost"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                    >
                      {(data ?? AI_COST_BREAKDOWN).map((entry, index) => (
                        <Cell key={entry.provider} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
