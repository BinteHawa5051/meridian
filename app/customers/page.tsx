"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomerTable } from "@/components/dashboard/customers/CustomerTable";
import { Pagination } from "@/components/ui/pagination";
import { useCustomers } from "@/hooks/useMeridianData";
import type { FullCustomer } from "@/lib/api-client";
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils";
import {
  Users, Search, TrendingUp, TrendingDown,
  DollarSign, Activity, AlertTriangle, RefreshCw,
  Download, UserPlus, X,
} from "lucide-react";

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatColor = "green" | "blue" | "orange" | "red";

const statColorMap: Record<StatColor, { bg: string; text: string }> = {
  green:  { bg: "bg-chart-green/10",  text: "text-chart-green"  },
  blue:   { bg: "bg-chart-blue/10",   text: "text-chart-blue"   },
  orange: { bg: "bg-chart-orange/10", text: "text-chart-orange" },
  red:    { bg: "bg-chart-red/10",    text: "text-chart-red"    },
};

function StatCard({
  label, value, sub, icon: Icon, color, delay,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: StatColor; delay: number;
}) {
  const c = statColorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <Icon className={cn("w-4 h-4", c.text)} />
        </div>
      </div>
      <p className="text-xl font-semibold text-meridian-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-meridian-text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-meridian-text-muted mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Plan distribution bar ────────────────────────────────────────────────────

function PlanBar({ customers }: { customers: FullCustomer[] }) {
  const total = customers.length || 1;
  const counts = customers.reduce((acc, c) => {
    const p = c.plan ?? "default";
    acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const plans = [
    { key: "enterprise", label: "Enterprise", color: "bg-meridian-burgundy" },
    { key: "scale",      label: "Scale",      color: "bg-chart-blue" },
    { key: "starter",    label: "Starter",    color: "bg-chart-green" },
    { key: "default",    label: "Default",    color: "bg-meridian-bg-hover" },
  ].filter((p) => (counts[p.key] ?? 0) > 0);

  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
        {plans.map((p) => (
          <div
            key={p.key}
            className={cn("h-full transition-all", p.color)}
            style={{ width: `${((counts[p.key] ?? 0) / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {plans.map((p) => (
          <div key={p.key} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", p.color)} />
            <span className="text-xs text-meridian-text-muted">{p.label}</span>
            <span className="text-xs font-medium text-meridian-text-primary tabular-nums">
              {counts[p.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "at-risk" | "churned">("all");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 20;
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ externalId: "", displayName: "", planTier: "default", markup: "0" });
  const [addSaving, setAddSaving] = React.useState(false);
  const [addError, setAddError] = React.useState("");

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useCustomers(debouncedSearch, page, PAGE_SIZE);
  const customers: FullCustomer[] = data?.customers ?? [];
  const pagination = (data as any)?.pagination;

  // Client-side status filter
  const filtered = React.useMemo(() => {
    if (statusFilter === "all") return customers;
    return customers.filter((c) => c.status === statusFilter);
  }, [customers, statusFilter]);

  // Derived summary stats
  const stats = React.useMemo(() => {
    const active  = customers.filter((c) => c.status === "active").length;
    const atRisk  = customers.filter((c) => c.status === "at-risk").length;
    const churned = customers.filter((c) => c.status === "churned").length;
    const totalRev  = customers.reduce((s, c) => s + c.revenue, 0);
    const totalCost = customers.reduce((s, c) => s + c.aiCost, 0);
    const avgMargin = customers.length
      ? customers.reduce((s, c) => s + c.margin, 0) / customers.length
      : 0;
    return { active, atRisk, churned, totalRev, totalCost, avgMargin };
  }, [customers]);

  // CSV export
  function handleExport() {
    const header = "Name,External ID,Plan,Status,Revenue,AI Cost,Profit,Margin %,Requests\n";
    const rows = filtered.map((c) =>
      [
        `"${c.name}"`, c.externalId, c.plan, c.status,
        c.revenue.toFixed(2), c.aiCost.toFixed(2),
        c.profit.toFixed(2), c.margin.toFixed(1), c.requests,
      ].join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "meridian-customers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const statusTabs = [
    { key: "all",     label: "All",     count: customers.length },
    { key: "active",  label: "Active",  count: stats.active },
    { key: "at-risk", label: "At Risk", count: stats.atRisk },
    { key: "churned", label: "Churned", count: stats.churned },
  ] as const;

  return (
    <Shell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Customers</h1>
          <p className="text-sm text-meridian-text-muted">
            {isLoading ? "Loading…" : `${customers.length} customers tracked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Customers"
          value={String(stats.active)}
          sub={`${stats.atRisk} at risk · ${stats.churned} churned`}
          icon={Users}
          color="green"
          delay={0.05}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRev)}
          icon={DollarSign}
          color="blue"
          delay={0.1}
        />
        <StatCard
          label="Total AI Cost"
          value={formatCurrency(stats.totalCost)}
          icon={Activity}
          color="orange"
          delay={0.15}
        />
        <StatCard
          label="Avg Margin"
          value={`${stats.avgMargin.toFixed(1)}%`}
          sub={stats.avgMargin >= 20 ? "Healthy" : stats.avgMargin >= 0 ? "At risk" : "Negative"}
          icon={stats.avgMargin >= 0 ? TrendingUp : TrendingDown}
          color={stats.avgMargin >= 20 ? "green" : stats.avgMargin >= 0 ? "orange" : "red"}
          delay={0.2}
        />
      </div>

      {/* Plan distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-meridian-text-muted uppercase tracking-wider mb-3">
              Plan Distribution
            </p>
            <PlanBar customers={customers} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Main table card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Loading customer data…"
                    : `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}${statusFilter !== "all" ? ` · ${statusFilter}` : ""}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-meridian-text-muted pointer-events-none" />
                  <Input
                    placeholder="Search name or ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 w-52 text-xs"
                  />
                </div>
                {isFetching && !isLoading && (
                  <RefreshCw className="w-3.5 h-3.5 text-meridian-text-muted animate-spin" />
                )}
              </div>
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 mt-4 border-b border-meridian-border">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-px",
                    statusFilter === tab.key
                      ? "border-meridian-burgundy-bright text-meridian-text-primary"
                      : "border-transparent text-meridian-text-muted hover:text-meridian-text-secondary"
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium tabular-nums",
                    statusFilter === tab.key
                      ? "bg-meridian-burgundy/20 text-meridian-burgundy-bright"
                      : "bg-meridian-bg-hover text-meridian-text-muted"
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-0">
            {/* At-risk warning banner */}
            {stats.atRisk > 0 && statusFilter === "all" && !isLoading && (
              <div className="flex items-center gap-2 px-6 py-2.5 bg-chart-orange/5 border-b border-chart-orange/20">
                <AlertTriangle className="w-3.5 h-3.5 text-chart-orange shrink-0" />
                <p className="text-xs text-chart-orange">
                  <span className="font-medium">{stats.atRisk} customer{stats.atRisk !== 1 ? "s" : ""}</span>
                  {" "}at risk — margin below 10%. Consider reviewing pricing or usage.
                </p>
              </div>
            )}

            <CustomerTable customers={filtered} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && pagination && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={PAGE_SIZE}
                onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            )}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                  <Users className="w-8 h-8 text-meridian-text-muted" />
                </div>
                <p className="text-sm font-medium text-meridian-text-secondary mb-1">
                  {search ? "No customers match your search" : "No customers yet"}
                </p>
                <p className="text-xs text-meridian-text-muted">
                  {search
                    ? "Try a different name or external ID"
                    : "Customers appear here once they start sending LLM events"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141416] border border-[#27272a] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-meridian-text-primary">Add Customer</h2>
                <button onClick={() => setShowAddModal(false)} className="text-meridian-text-muted hover:text-meridian-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAddSaving(true); setAddError("");
                try {
                  const res = await fetch("/api/meridian/customers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...addForm, orgId: "00000000-0000-0000-0000-000000000000", markup: parseFloat(addForm.markup) / 100 }),
                  });
                  const d = await res.json();
                  if (!res.ok) throw new Error(d.error ?? "Failed");
                  setShowAddModal(false);
                  refetch();
                } catch (err: unknown) {
                  setAddError(err instanceof Error ? err.message : "Failed");
                } finally { setAddSaving(false); }
              }} className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#A1A1AA] mb-1 block">External ID *</label>
                  <Input placeholder="cus_acme" value={addForm.externalId} onChange={(e) => setAddForm({ ...addForm, externalId: e.target.value })} className="h-9" required />
                </div>
                <div>
                  <label className="text-[11px] text-[#A1A1AA] mb-1 block">Display Name</label>
                  <Input placeholder="Acme Corp" value={addForm.displayName} onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })} className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#A1A1AA] mb-1 block">Plan Tier</label>
                    <select value={addForm.planTier} onChange={(e) => setAddForm({ ...addForm, planTier: e.target.value })}
                      className="w-full h-9 text-sm rounded-xl bg-[#1a1a1d] border border-[#27272a] px-2 text-[#F5F5F5]">
                      <option value="default">Default</option>
                      <option value="starter">Starter</option>
                      <option value="scale">Scale</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#A1A1AA] mb-1 block">Markup %</label>
                    <Input type="number" min="0" max="200" step="1" value={addForm.markup}
                      onChange={(e) => setAddForm({ ...addForm, markup: e.target.value })} className="h-9" />
                  </div>
                </div>
                {addError && <p className="text-xs text-[#EF4444]">{addError}</p>}
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" size="sm" type="submit" disabled={addSaving} className="flex-1">
                    {addSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <UserPlus className="w-3.5 h-3.5 mr-1.5" />}
                    {addSaving ? "Adding…" : "Add Customer"}
                  </Button>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
