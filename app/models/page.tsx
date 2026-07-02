"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { meridianApi } from "@/lib/api-client";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils";
import {
  Brain, Search, RefreshCw, TrendingUp, DollarSign,
  Zap, Clock, BarChart3, ChevronDown, ChevronUp,
} from "lucide-react";
import type { ModelData } from "@/lib/types";

// ─── Provider colour map ──────────────────────────────────────────────────────

const providerColors: Record<string, string> = {
  OpenAI:    "#3B82F6",
  Anthropic: "#8B5CF6",
  Google:    "#10B981",
  Groq:      "#F97316",
  Mistral:   "#EC4899",
  Bedrock:   "#06B6D4",
};

function ProviderDot({ provider }: { provider: string }) {
  const color = providerColors[provider] ?? "#71717A";
  return <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />;
}

// ─── Latency bar (visual) ─────────────────────────────────────────────────────

function LatencyBar({ latency, max }: { latency: number; max: number }) {
  const pct = max > 0 ? (latency / max) * 100 : 0;
  const color = latency < 0.5 ? "bg-chart-green" : latency < 1.5 ? "bg-chart-orange" : "bg-chart-red";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-meridian-text-secondary">{latency.toFixed(2)}s</span>
    </div>
  );
}

// ─── Cost bar (visual) ────────────────────────────────────────────────────────

function CostBar({ cost, maxCost }: { cost: number; maxCost: number }) {
  const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden max-w-[80px]">
        <div className="h-full rounded-full bg-chart-blue" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums font-medium text-meridian-text-primary">
        {formatCurrency(cost)}
      </span>
    </div>
  );
}

// ─── Pricing table (from model_pricing DB table) ──────────────────────────────

interface PricingRow {
  provider: string; model: string;
  inputPricePerMillion: number;
  cachedInputPricePerMillion: number;
  outputPricePerMillion: number;
  active: boolean; updatedAt: string;
}

function PricingTable() {
  const { data, isLoading } = useQuery<{ pricing: PricingRow[] }>({
    queryKey: ["meridian", "pricing"],
    queryFn: () => fetch("/api/meridian/pricing").then((r) => r.json()),
    staleTime: 10 * 60 * 1000,
  });
  const [search, setSearch] = React.useState("");

  const rows = (data?.pricing ?? []).filter(
    (r) =>
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Model Pricing</CardTitle>
            <CardDescription>Per-million-token rates (USD) from model_pricing table</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-meridian-text-muted" />
            <Input
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Input / 1M tokens</TableHead>
                <TableHead>Cached Input / 1M</TableHead>
                <TableHead>Output / 1M tokens</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <motion.tr
                  key={`${r.provider}-${r.model}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors"
                >
                  <TableCell className="font-medium text-sm">{r.model}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ProviderDot provider={r.provider.charAt(0).toUpperCase() + r.provider.slice(1)} />
                      <span className="text-xs capitalize">{r.provider}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">${r.inputPricePerMillion.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums text-xs text-chart-green">${r.cachedInputPricePerMillion.toFixed(3)}</TableCell>
                  <TableCell className="tabular-nums text-xs">${r.outputPricePerMillion.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={r.active ? "success" : "default"} className="text-[10px]">
                      {r.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortKey = "cost" | "requests" | "tokens" | "latency" | "percentage";

export default function ModelsPage() {
  const { dateRange } = useDashboardStore();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["meridian", "models", dateRange],
    queryFn: () => meridianApi.getModels(dateRange),
    staleTime: 60 * 1000,
  });

  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("cost");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const models: ModelData[] = data?.models ?? [];

  const filtered = React.useMemo(() => {
    const list = search
      ? models.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase())
        )
      : models;
    return [...list].sort((a, b) => {
      const cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [models, search, sortKey, sortDir]);

  const maxLatency = Math.max(...filtered.map((m) => m.latency), 0.01);
  const maxCost    = Math.max(...filtered.map((m) => m.cost),    1);

  const totalCost     = models.reduce((s, m) => s + m.cost,     0);
  const totalRequests = models.reduce((s, m) => s + m.requests, 0);
  const totalTokens   = models.reduce((s, m) => s + m.tokens,   0);
  const avgLatency    = models.length
    ? models.reduce((s, m) => s + m.latency, 0) / models.length
    : 0;

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    return (
      <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-meridian-text-primary transition-colors">
        {label}
        {sortKey === col
          ? sortDir === "asc"
            ? <ChevronUp   className="w-3 h-3 text-meridian-burgundy-bright" />
            : <ChevronDown className="w-3 h-3 text-meridian-burgundy-bright" />
          : <ChevronDown className="w-3 h-3 opacity-20" />}
      </button>
    );
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Models</h1>
          <p className="text-sm text-meridian-text-muted">
            {isLoading ? "Loading…" : `${models.length} models in use`}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Cost",      value: formatCurrency(totalCost),           icon: DollarSign, bg: "bg-chart-blue/10",   text: "text-chart-blue"   },
          { label: "Total Requests",  value: formatCompactNumber(totalRequests),   icon: BarChart3,  bg: "bg-chart-green/10",  text: "text-chart-green"  },
          { label: "Total Tokens",    value: formatCompactNumber(totalTokens),     icon: Zap,        bg: "bg-chart-purple/10", text: "text-chart-purple" },
          { label: "Avg Latency",     value: `${avgLatency.toFixed(2)}s`,          icon: Clock,      bg: "bg-chart-orange/10", text: "text-chart-orange" },
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

      {/* Tabs: Usage / Pricing */}
      <Tabs defaultValue="usage">
        <TabsList className="mb-4">
          <TabsTrigger value="usage"   className="text-xs gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Usage</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Pricing</TabsTrigger>
        </TabsList>

        {/* ─── Usage tab ─────────────────────────────────────────────── */}
        <TabsContent value="usage">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Model Usage</CardTitle>
                  <CardDescription>Cost, requests, tokens and latency by model</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-meridian-text-muted" />
                  <Input
                    placeholder="Search models…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 w-48 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead><SortBtn col="cost"       label="Cost"     /></TableHead>
                      <TableHead><SortBtn col="requests"   label="Requests" /></TableHead>
                      <TableHead><SortBtn col="tokens"     label="Tokens"   /></TableHead>
                      <TableHead><SortBtn col="latency"    label="Latency"  /></TableHead>
                      <TableHead><SortBtn col="percentage" label="Share"    /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((model, i) => (
                      <motion.tr
                        key={model.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors"
                      >
                        <TableCell className="font-medium text-sm">{model.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ProviderDot provider={model.provider} />
                            <span className="text-xs">{model.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell><CostBar cost={model.cost} maxCost={maxCost} /></TableCell>
                        <TableCell className="tabular-nums text-xs text-meridian-text-secondary">
                          {formatCompactNumber(model.requests)}
                        </TableCell>
                        <TableCell className="tabular-nums text-xs text-meridian-text-secondary">
                          {formatCompactNumber(model.tokens)}
                        </TableCell>
                        <TableCell><LatencyBar latency={model.latency} max={maxLatency} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden">
                              <div
                                className="h-full rounded-full bg-meridian-burgundy"
                                style={{ width: `${Math.min(model.percentage * 2, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums">{model.percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Pricing tab ───────────────────────────────────────────── */}
        <TabsContent value="pricing">
          <PricingTable />
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
