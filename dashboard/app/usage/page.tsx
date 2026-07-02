"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { useTimeSeries, useBreakdown, useHeatmap } from "@/hooks/useMeridianData";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatCurrency, formatCompactNumber, formatCompactCurrency, cn } from "@/lib/utils";
import {
  BarChart3, Zap, Clock, TrendingUp, RefreshCw,
  DollarSign, Activity, Layers,
} from "lucide-react";
import { DAY_LABELS, HOUR_LABELS } from "@/lib/constants";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1d] border border-[#27272a] rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[#71717A] mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-[#A1A1AA]">{entry.name}:</span>
          <span className="text-[#F5F5F5] font-medium tabular-nums">
            {typeof entry.value === "number" && entry.value > 100
              ? formatCompactCurrency(entry.value)
              : formatCompactNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, delta, icon: Icon, bg, text, delay }: {
  label: string; value: string; delta?: string;
  icon: React.ElementType; bg: string; text: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel-hover p-5"
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg)}>
        <Icon className={cn("w-4 h-4", text)} />
      </div>
      <p className="text-xl font-semibold tabular-nums text-[#F5F5F5]">{value}</p>
      <p className="text-xs text-[#71717A] mt-0.5">{label}</p>
      {delta && (
        <p className={cn("text-[11px] mt-1", delta.startsWith("+") ? "text-[#10B981]" : "text-[#EF4444]")}>
          {delta} vs prev period
        </p>
      )}
    </motion.div>
  );
}

// ─── Usage heatmap (reused from dashboard) ────────────────────────────────────

function HeatmapSection({ data }: { data?: Array<{ day: number; hour: number; value: number }> }) {
  const heatmapData = data ?? [];
  const grouped = DAY_LABELS.map((_, d) => heatmapData.filter((x) => x.day === d));
  const maxVal = Math.max(...heatmapData.map((d) => d.value), 1);

  function getColor(v: number) {
    const i = v / maxVal;
    if (i < 0.2) return "bg-[#1a1a1d]";
    if (i < 0.4) return "bg-[#7A1F34]/20";
    if (i < 0.6) return "bg-[#7A1F34]/35";
    if (i < 0.8) return "bg-[#7A1F34]/55";
    return "bg-[#7A1F34]/75";
  }

  if (!heatmapData.length) {
    return <div className="skeleton h-32 rounded-xl" />;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 min-w-[600px]">
        <div className="flex flex-col gap-1 pr-2 pt-8">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-3 text-[10px] text-[#71717A] text-right leading-3">{d}</div>
          ))}
        </div>
        <div className="flex-1">
          <div className="flex gap-1 mb-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 text-[8px] text-[#71717A] text-center h-8 leading-8">{i}h</div>
            ))}
          </div>
          {grouped.map((row, d) => (
            <div key={d} className="flex gap-1 mb-1">
              {row.map((cell) => (
                <div
                  key={cell.hour}
                  className={cn("flex-1 aspect-square rounded-sm cursor-pointer hover:ring-1 hover:ring-[#A52D4F]", getColor(cell.value))}
                  title={`${DAY_LABELS[d]} ${cell.hour}:00 — ${cell.value} req`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[10px] text-[#71717A]">Low</span>
        {[0.15, 0.30, 0.48, 0.62, 0.78].map((o) => (
          <div key={o} className="w-3 h-3 rounded" style={{ backgroundColor: `rgba(122,31,52,${o})` }} />
        ))}
        <span className="text-[10px] text-[#71717A]">High</span>
      </div>
    </div>
  );
}

// ─── Provider colours ─────────────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#3B82F6", anthropic: "#8B5CF6", google: "#10B981",
  groq: "#F97316", mistral: "#EC4899", other: "#71717A",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsagePage() {
  const { dateRange } = useDashboardStore();
  const { data: tsData,  isLoading: tsLoading,  isFetching, refetch } = useTimeSeries();
  const { data: bkData,  isLoading: bkLoading  } = useBreakdown();
  const { data: hmData,  isLoading: hmLoading  } = useHeatmap();

  const timeseries  = tsData?.timeseries  ?? [];
  const byProvider  = bkData?.byProvider  ?? [];
  const byModel     = bkData?.byModel     ?? [];

  // Derived summary stats from timeseries
  const totalCost     = timeseries.reduce((s, d) => s + d.total, 0);
  const totalRequests = (bkData?.byModel ?? []).reduce((s, m) => s + m.requests, 0);
  const totalTokens   = (bkData?.byModel ?? []).reduce((s, m) => s + m.tokens,   0);
  const avgDailyCost  = timeseries.length ? totalCost / timeseries.length : 0;

  // Stacked area providers (keys present in data)
  const providers = ["openai", "anthropic", "google", "groq", "mistral", "other"];

  // Build request-count timeseries from model data (approx ratio)
  const reqTimeseries = timeseries.map((d) => ({
    date: d.date,
    requests: totalCost > 0 ? Math.round((d.total / totalCost) * totalRequests) : 0,
  }));

  return (
    <Shell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Usage</h1>
          <p className="text-sm text-[#71717A]">
            Detailed AI token and cost analytics · {dateRange}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Cost"       value={formatCompactCurrency(totalCost)}     icon={DollarSign} bg="bg-[#3B82F6]/10" text="text-[#3B82F6]" delay={0.05} />
        <StatCard label="Total Requests"   value={formatCompactNumber(totalRequests)}   icon={Activity}   bg="bg-[#10B981]/10" text="text-[#10B981]" delay={0.10} />
        <StatCard label="Total Tokens"     value={formatCompactNumber(totalTokens)}     icon={Zap}        bg="bg-[#8B5CF6]/10" text="text-[#8B5CF6]" delay={0.15} />
        <StatCard label="Avg Daily Cost"   value={formatCompactCurrency(avgDailyCost)}  icon={TrendingUp} bg="bg-[#F97316]/10" text="text-[#F97316]" delay={0.20} />
      </div>

      {/* Charts tabs */}
      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost"      className="text-xs gap-1.5"><DollarSign className="w-3.5 h-3.5" />Cost Over Time</TabsTrigger>
          <TabsTrigger value="requests"  className="text-xs gap-1.5"><BarChart3  className="w-3.5 h-3.5" />Requests</TabsTrigger>
          <TabsTrigger value="providers" className="text-xs gap-1.5"><Layers     className="w-3.5 h-3.5" />By Provider</TabsTrigger>
          <TabsTrigger value="heatmap"   className="text-xs gap-1.5"><Activity   className="w-3.5 h-3.5" />Heatmap</TabsTrigger>
        </TabsList>

        {/* ── Cost over time ───────────────────────────────────────── */}
        <TabsContent value="cost">
          <Card>
            <CardHeader>
              <CardTitle>Cost Over Time</CardTitle>
              <CardDescription>Daily AI spend stacked by provider</CardDescription>
            </CardHeader>
            <CardContent>
              {tsLoading ? (
                <div className="skeleton h-72" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        {providers.map((p) => (
                          <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={PROVIDER_COLORS[p]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={PROVIDER_COLORS[p]} stopOpacity={0}   />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => formatCompactCurrency(v)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#A1A1AA" }} iconType="circle" iconSize={8} />
                      {providers.map((p) => (
                        <Area key={p} type="monotone" dataKey={p} name={p.charAt(0).toUpperCase() + p.slice(1)}
                          stroke={PROVIDER_COLORS[p]} strokeWidth={2}
                          fill={`url(#grad-${p})`} animationDuration={1200}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Requests over time ───────────────────────────────────── */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>Daily LLM request count (estimated from cost ratio)</CardDescription>
            </CardHeader>
            <CardContent>
              {tsLoading ? (
                <div className="skeleton h-72" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reqTimeseries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => formatCompactNumber(v)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="requests" name="Requests" fill="#3B82F6" radius={[2, 2, 0, 0]} animationDuration={1200} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── By provider ──────────────────────────────────────────── */}
        <TabsContent value="providers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Provider cost breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost by Provider</CardTitle>
                <CardDescription>Total spend share per LLM provider</CardDescription>
              </CardHeader>
              <CardContent>
                {bkLoading ? <div className="skeleton h-60" /> : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byProvider} layout="vertical" margin={{ top: 5, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                          tickFormatter={(v) => formatCompactCurrency(v)} />
                        <YAxis type="category" dataKey="provider" tick={{ fill: "#A1A1AA", fontSize: 11 }}
                          tickLine={false} axisLine={false} width={90} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="cost" name="Cost" radius={[0, 4, 4, 0]} animationDuration={1200}>
                          {byProvider.map((entry) => (
                            <Cell key={entry.provider} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider table */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Summary</CardTitle>
                <CardDescription>Cost and share by provider for the period</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {bkLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-[#27272a]">
                    {byProvider.map((p) => (
                      <div key={p.provider} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-sm font-medium text-[#F5F5F5]">{p.provider}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-1.5 rounded-full bg-[#1a1a1d] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.percentage}%`, backgroundColor: p.color }} />
                          </div>
                          <span className="text-xs tabular-nums text-[#A1A1AA] w-10 text-right">
                            {p.percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm tabular-nums font-medium text-[#F5F5F5] w-20 text-right">
                            {formatCompactCurrency(p.cost)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top models table */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Top Models by Cost</CardTitle>
              <CardDescription>Highest spend models in the selected period</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {bkLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
                </div>
              ) : (
                <div className="divide-y divide-[#27272a]">
                  {byModel.slice(0, 8).map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between px-6 py-3 hover:bg-[#1a1a1d]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#71717A] tabular-nums w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-[#F5F5F5]">{m.name}</span>
                        <Badge variant="default" className="text-[10px]">{m.provider}</Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs text-[#71717A]">{formatCompactNumber(m.requests)} req</span>
                        <span className="text-xs text-[#71717A]">{formatCompactNumber(m.tokens)} tok</span>
                        <span className="text-sm tabular-nums font-medium text-[#F5F5F5]">{formatCompactCurrency(m.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Heatmap ──────────────────────────────────────────────── */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Request Volume Heatmap</CardTitle>
              <CardDescription>When your customers are hitting the LLM APIs most</CardDescription>
            </CardHeader>
            <CardContent>
              {hmLoading
                ? <div className="skeleton h-40" />
                : <HeatmapSection data={hmData?.heatmap} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
