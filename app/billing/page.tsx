"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useRevenue } from "@/hooks/useMeridianData";
import { generateRevenueData } from "@/lib/mock-data";
import { formatCurrency, formatCompactCurrency, formatRelativeTime, cn } from "@/lib/utils";
import {
  CreditCard, DollarSign, TrendingUp, RefreshCw,
  CheckCircle2, XCircle, Clock, ExternalLink, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeterEvent {
  id: string;
  customerId: string | null;
  llmEventId: string;
  stripeEventId: string | null;
  amountUsd: number;
  status: "pending" | "confirmed" | "failed";
  emittedAt: string;
  confirmedAt: string | null;
  retryCount: number;
}

interface BillingStats {
  totalBilled: number;
  pendingCount: number;
  failedCount: number;
  confirmedCount: number;
}

const MOCK_METER_EVENTS: MeterEvent[] = [
  {
    id: "me_001",
    customerId: "cus_001",
    llmEventId: "0f5a8d4e-6e32-4dd3-8dd2-4ebc1e4f00a1",
    stripeEventId: "evt_1Pmock001",
    amountUsd: 124.58,
    status: "confirmed",
    emittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    retryCount: 0,
  },
  {
    id: "me_002",
    customerId: "cus_002",
    llmEventId: "4e66a5b0-2e6f-4a19-8c4a-4f4f1dfe00b2",
    stripeEventId: null,
    amountUsd: 38.12,
    status: "pending",
    emittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 1,
  },
  {
    id: "me_003",
    customerId: "cus_003",
    llmEventId: "b71c9f9f-8a1d-4af1-a2c0-0b4b1c5f00c3",
    stripeEventId: "evt_1Pmock003",
    amountUsd: 219.74,
    status: "failed",
    emittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    confirmedAt: null,
    retryCount: 2,
  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1d] border border-[#27272a] rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[#71717A] mb-2">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-[#A1A1AA]">{e.name}:</span>
          <span className="text-[#F5F5F5] font-medium tabular-nums">{formatCompactCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { data: revenueData, isLoading: revLoading } = useRevenue();
  const [meterEvents, setMeterEvents] = React.useState<MeterEvent[]>(MOCK_METER_EVENTS);
  const [stats, setStats] = React.useState<BillingStats>(() => ({
    totalBilled: MOCK_METER_EVENTS.reduce((sum, event) => sum + event.amountUsd, 0),
    pendingCount: MOCK_METER_EVENTS.filter((event) => event.status === "pending").length,
    failedCount: MOCK_METER_EVENTS.filter((event) => event.status === "failed").length,
    confirmedCount: MOCK_METER_EVENTS.filter((event) => event.status === "confirmed").length,
  }));
  const [metersLoading, setMetersLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/meridian/billing")
      .then((r) => r.json())
      .then((d) => {
        if (d.events?.length) setMeterEvents(d.events);
        if (d.stats) setStats(d.stats);
      })
      .catch(() => {})
      .finally(() => setMetersLoading(false));
  }, []);

  const revenue = revenueData?.revenue?.length ? revenueData.revenue : generateRevenueData();

  // Running totals for the revenue chart
  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const totalCost    = revenue.reduce((s, r) => s + r.cost, 0);
  const avgMargin    = revenue.length
    ? revenue.reduce((s, r) => s + r.margin, 0) / revenue.length
    : 0;

  const statusConfig: Record<MeterEvent["status"], { label: string; variant: "success" | "danger" | "warning"; icon: React.ElementType }> = {
    confirmed: { label: "Confirmed", variant: "success", icon: CheckCircle2 },
    failed:    { label: "Failed",    variant: "danger",  icon: XCircle      },
    pending:   { label: "Pending",   variant: "warning", icon: Clock        },
  };

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Billing</h1>
          <p className="text-sm text-meridian-text-muted">
            Stripe meter events and revenue reconciliation
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="https://dashboard.stripe.com/billing" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Stripe
          </a>
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Billed",    value: formatCompactCurrency(stats.totalBilled),  bg: "bg-chart-blue/10",   text: "text-chart-blue",   icon: DollarSign  },
          { label: "Confirmed",       value: String(stats.confirmedCount),              bg: "bg-chart-green/10",  text: "text-chart-green",  icon: CheckCircle2 },
          { label: "Pending",         value: String(stats.pendingCount),                bg: "bg-chart-orange/10", text: "text-chart-orange", icon: Clock        },
          { label: "Failed / Retry",  value: String(stats.failedCount),                 bg: "bg-chart-red/10",    text: "text-chart-red",    icon: XCircle      },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel-hover p-5"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.text)} />
            </div>
            <p className="text-xl font-semibold tabular-nums text-meridian-text-primary">{s.value}</p>
            <p className="text-xs text-meridian-text-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue" className="text-xs gap-1.5"><BarChart3  className="w-3.5 h-3.5" />Revenue</TabsTrigger>
          <TabsTrigger value="meters"  className="text-xs gap-1.5"><CreditCard className="w-3.5 h-3.5" />Meter Events</TabsTrigger>
        </TabsList>

        {/* ── Revenue tab ──────────────────────────────────────────── */}
        <TabsContent value="revenue">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Monthly Revenue vs Cost</CardTitle>
              <CardDescription>12-month revenue, AI cost and margin trend</CardDescription>
            </CardHeader>
            <CardContent>
              {revLoading ? (
                <div className="skeleton h-72" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenue} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => formatCompactCurrency(v)} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#A1A1AA" }} iconType="circle" iconSize={8} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} dot={false} animationDuration={1200} />
                      <Line type="monotone" dataKey="cost"    name="AI Cost" stroke="#EF4444" strokeWidth={2} dot={false} animationDuration={1200} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Revenue, cost, and margin per month</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>AI Cost</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <TableCell key={j}><div className="skeleton h-4 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : [...revenue].reverse().map((r, i) => (
                        <motion.tr
                          key={r.month}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors"
                        >
                          <TableCell className="font-medium">{r.month}</TableCell>
                          <TableCell className="tabular-nums">{formatCurrency(r.revenue)}</TableCell>
                          <TableCell className="tabular-nums text-meridian-text-secondary">{formatCurrency(r.cost)}</TableCell>
                          <TableCell className={cn("tabular-nums font-medium",
                            r.revenue - r.cost >= 0 ? "text-chart-green" : "text-chart-red"
                          )}>
                            {formatCurrency(r.revenue - r.cost)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", r.margin >= 20 ? "bg-chart-green" : r.margin >= 0 ? "bg-chart-orange" : "bg-chart-red")}
                                  style={{ width: `${Math.min(Math.abs(r.margin) * 2, 100)}%` }}
                                />
                              </div>
                              <span className={cn("text-xs tabular-nums",
                                r.margin >= 20 ? "text-chart-green" : r.margin >= 0 ? "text-chart-orange" : "text-chart-red"
                              )}>
                                {r.margin.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Meter events tab ─────────────────────────────────────── */}
        <TabsContent value="meters">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stripe Meter Events</CardTitle>
                  <CardDescription>Billing audit trail — one record per LLM event</CardDescription>
                </div>
                {stats.failedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-red/10 border border-chart-red/20">
                    <XCircle className="w-3.5 h-3.5 text-chart-red" />
                    <span className="text-xs text-chart-red font-medium">
                      {stats.failedCount} failed — pending retry
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {metersLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : meterEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                    <CreditCard className="w-8 h-8 text-meridian-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-meridian-text-secondary mb-1">No meter events yet</p>
                  <p className="text-xs text-meridian-text-muted">
                    Events appear here after the worker processes LLM calls
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LLM Event ID</TableHead>
                      <TableHead>Stripe Event ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Emitted</TableHead>
                      <TableHead>Retries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meterEvents.map((e, i) => {
                      const s = statusConfig[e.status];
                      const SIcon = s.icon;
                      return (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors"
                        >
                          <TableCell>
                            <code className="text-xs font-mono text-meridian-text-muted">
                              {e.llmEventId.slice(0, 8)}…
                            </code>
                          </TableCell>
                          <TableCell>
                            {e.stripeEventId ? (
                              <code className="text-xs font-mono text-chart-blue">{e.stripeEventId.slice(0, 12)}…</code>
                            ) : (
                              <span className="text-xs text-meridian-text-muted">—</span>
                            )}
                          </TableCell>
                          <TableCell className="tabular-nums font-medium text-sm">
                            {formatCurrency(e.amountUsd)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <SIcon className={cn("w-3.5 h-3.5",
                                e.status === "confirmed" ? "text-chart-green" :
                                e.status === "failed"    ? "text-chart-red"   : "text-chart-orange"
                              )} />
                              <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-meridian-text-muted">
                            {formatRelativeTime(new Date(e.emittedAt))}
                          </TableCell>
                          <TableCell className="text-xs text-meridian-text-muted tabular-nums">
                            {e.retryCount}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
