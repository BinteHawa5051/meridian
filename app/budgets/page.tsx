"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useBudgets } from "@/hooks/useMeridianData";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Wallet, Plus, ShieldBan, ArrowDown, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, TrendingUp, DollarSign,
  BarChart3, Shield,
} from "lucide-react";
import type { BudgetEnforcement } from "@/lib/types";

// ─── Stat card (reusable pattern) ─────────────────────────────────────────────

type StatColor = "green" | "blue" | "orange" | "red" | "purple";
const statColors: Record<StatColor, { bg: string; icon: string }> = {
  green:  { bg: "bg-chart-green/10",  icon: "text-chart-green"  },
  blue:   { bg: "bg-chart-blue/10",   icon: "text-chart-blue"   },
  orange: { bg: "bg-chart-orange/10", icon: "text-chart-orange" },
  red:    { bg: "bg-chart-red/10",    icon: "text-chart-red"    },
  purple: { bg: "bg-chart-purple/10", icon: "text-chart-purple" },
};

function StatCard({ label, value, icon: Icon, color, delay }: {
  label: string; value: string; icon: React.ElementType;
  color: StatColor; delay: number;
}) {
  const c = statColors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel-hover p-5"
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", c.bg)}>
        <Icon className={cn("w-4 h-4", c.icon)} />
      </div>
      <p className="text-xl font-semibold text-meridian-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-meridian-text-muted mt-0.5">{label}</p>
    </motion.div>
  );
}

// ─── Action config ────────────────────────────────────────────────────────────

const actionConfig: Record<BudgetEnforcement["action"], {
  icon: React.ElementType; label: string;
  badgeVariant: "danger" | "warning" | "primary" | "info";
  rowBg: string;
}> = {
  blocked:     { icon: ShieldBan,     label: "Blocked",     badgeVariant: "danger",  rowBg: "border-l-chart-red/40" },
  downgraded:  { icon: ArrowDown,     label: "Downgraded",  badgeVariant: "warning", rowBg: "border-l-chart-orange/40" },
  warning:     { icon: AlertTriangle, label: "Warning",     badgeVariant: "warning", rowBg: "border-l-chart-orange/30" },
  "auto-switch": { icon: RefreshCw,  label: "Auto-Switch", badgeVariant: "primary", rowBg: "border-l-meridian-burgundy/40" },
};

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-meridian-bg overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-chart-red" : pct >= 90 ? "bg-chart-orange" : "bg-chart-blue",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        "text-[11px] tabular-nums font-medium shrink-0",
        pct >= 100 ? "text-chart-red" : pct >= 90 ? "text-chart-orange" : "text-meridian-text-secondary",
      )}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

// ─── New budget form (inline slide-down) ─────────────────────────────────────

function NewBudgetForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = React.useState({
    customerId: "", scope: "customer", dailyLimit: "", monthlyLimit: "", onBreach: "block", fallbackModel: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) { setError("Customer ID is required"); return; }
    if (!form.dailyLimit && !form.monthlyLimit) { setError("Set at least one limit"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/meridian/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: "00000000-0000-0000-0000-000000000000", // placeholder — real auth sets this
          customerId: form.customerId || undefined,
          scope: form.scope,
          dailyLimitUsd:   form.dailyLimit   ? parseFloat(form.dailyLimit)   : undefined,
          monthlyLimitUsd: form.monthlyLimit ? parseFloat(form.monthlyLimit) : undefined,
          onBreach: form.onBreach,
          fallbackModel: form.fallbackModel || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-8 text-xs bg-meridian-bg-hover border-meridian-border focus:border-meridian-burgundy/50";
  const labelClass = "text-[11px] text-meridian-text-muted mb-1 block";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="border-b border-meridian-border px-6 py-5 bg-meridian-bg-hover/30">
        <p className="text-sm font-medium text-meridian-text-primary mb-4">New Budget Rule</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div>
            <label className={labelClass}>Customer ID</label>
            <Input className={inputClass} placeholder="UUID or ext ID"
              value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Scope</label>
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
            >
              <option value="customer">Customer</option>
              <option value="feature">Feature</option>
              <option value="model">Model</option>
              <option value="org">Org</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Daily Limit ($)</label>
            <Input className={inputClass} placeholder="e.g. 50"
              type="number" min="0" step="0.01"
              value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Monthly Limit ($)</label>
            <Input className={inputClass} placeholder="e.g. 500"
              type="number" min="0" step="0.01"
              value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>On Breach</label>
            <select
              value={form.onBreach}
              onChange={(e) => setForm({ ...form, onBreach: e.target.value })}
              className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
            >
              <option value="block">Block</option>
              <option value="route">Route (fallback)</option>
              <option value="alert">Alert only</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Fallback Model</label>
            <Input className={inputClass} placeholder="e.g. gpt-4o-mini"
              value={form.fallbackModel} onChange={(e) => setForm({ ...form, fallbackModel: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-xs text-chart-red mb-3">{error}</p>}
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Save Budget Rule
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetsPage() {
  const { data, isLoading, isFetching, refetch } = useBudgets();
  const [showForm, setShowForm] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "critical" | "warning" | "info">("all");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const enforcements: BudgetEnforcement[] = data?.enforcements ?? [];

  const filtered = React.useMemo(() => {
    const list = filter === "all" ? enforcements : enforcements.filter((e) => e.severity === filter);
    return [...list].sort((a, b) => {
      const av = b.budget > 0 ? b.spent / b.budget : 0;
      const bv = a.budget > 0 ? a.spent / a.budget : 0;
      return sortDir === "desc" ? av - bv : bv - av;
    });
  }, [enforcements, filter, sortDir]);

  const stats = React.useMemo(() => ({
    total:    enforcements.length,
    critical: enforcements.filter((e) => e.severity === "critical").length,
    warning:  enforcements.filter((e) => e.severity === "warning").length,
    totalBudget: enforcements.reduce((s, e) => s + e.budget, 0),
    totalSpent:  enforcements.reduce((s, e) => s + e.spent,  0),
  }), [enforcements]);

  const filterTabs = [
    { key: "all",      label: "All",      count: stats.total },
    { key: "critical", label: "Critical", count: stats.critical },
    { key: "warning",  label: "Warning",  count: stats.warning },
    { key: "info",     label: "OK",       count: enforcements.filter((e) => e.severity === "info").length },
  ] as const;

  return (
    <Shell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Budgets</h1>
          <p className="text-sm text-meridian-text-muted">
            {isLoading ? "Loading…" : `${enforcements.length} active budget rules`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Budget Rule
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Rules"    value={String(stats.total)}                color="blue"   icon={Shield}     delay={0.05} />
        <StatCard label="Critical Alerts" value={String(stats.critical)}             color="red"    icon={ShieldBan}  delay={0.1}  />
        <StatCard label="Total Budget"    value={formatCurrency(stats.totalBudget)}  color="purple" icon={Wallet}     delay={0.15} />
        <StatCard label="Total Spent"     value={formatCurrency(stats.totalSpent)}   color="orange" icon={DollarSign} delay={0.2}  />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Rules</CardTitle>
                <CardDescription>
                  {isLoading ? "Loading…" : `${filtered.length} rule${filtered.length !== 1 ? "s" : ""}${filter !== "all" ? ` · ${filter}` : ""}`}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}>
                Usage
                {sortDir === "desc"
                  ? <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  : <ChevronUp   className="w-3.5 h-3.5 ml-1" />}
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mt-4 border-b border-meridian-border">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-px",
                    filter === tab.key
                      ? "border-meridian-burgundy-bright text-meridian-text-primary"
                      : "border-transparent text-meridian-text-muted hover:text-meridian-text-secondary"
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full tabular-nums",
                    filter === tab.key
                      ? "bg-meridian-burgundy/20 text-meridian-burgundy-bright"
                      : "bg-meridian-bg-hover text-meridian-text-muted"
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>

          {/* Inline new budget form */}
          <AnimatePresence>
            {showForm && <NewBudgetForm onClose={() => setShowForm(false)} />}
          </AnimatePresence>

          <CardContent className="p-0">
            {/* Critical banner */}
            {stats.critical > 0 && !isLoading && (
              <div className="flex items-center gap-2 px-6 py-2.5 bg-chart-red/5 border-b border-chart-red/20">
                <ShieldBan className="w-3.5 h-3.5 text-chart-red shrink-0" />
                <p className="text-xs text-chart-red">
                  <span className="font-medium">{stats.critical} budget{stats.critical !== 1 ? "s" : ""} exceeded</span>
                  {" "}— requests are being blocked or rerouted.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                  <Wallet className="w-8 h-8 text-meridian-text-muted" />
                </div>
                <p className="text-sm font-medium text-meridian-text-secondary mb-1">No budget rules yet</p>
                <p className="text-xs text-meridian-text-muted mb-4">
                  Create a rule to start enforcing spend limits
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> New Budget Rule
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Model / Feature</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Fallback</TableHead>
                    <TableHead>Spent / Budget</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filtered.map((rule, i) => {
                      const cfg = actionConfig[rule.action];
                      const Icon = cfg.icon;
                      return (
                        <motion.tr
                          key={rule.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "border-b border-meridian-border border-l-2 hover:bg-meridian-bg-hover/50 transition-colors",
                            cfg.rowBg
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-meridian-bg-hover flex items-center justify-center text-xs font-semibold text-meridian-text-secondary shrink-0">
                                {rule.customer.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{rule.customer}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-meridian-text-muted capitalize">customer</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-meridian-text-secondary">{rule.model}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-meridian-text-muted" />
                              <Badge variant={cfg.badgeVariant} className="text-[10px] px-1.5 py-0">
                                {cfg.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-chart-blue">
                              {rule.fallback ?? <span className="text-meridian-text-muted">—</span>}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums text-xs">
                            <span className={rule.spent > rule.budget ? "text-chart-red" : "text-meridian-text-primary"}>
                              {formatCurrency(rule.spent)}
                            </span>
                            <span className="text-meridian-text-muted"> / {formatCurrency(rule.budget)}</span>
                          </TableCell>
                          <TableCell>
                            <UsageBar spent={rule.spent} budget={rule.budget} />
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              rule.severity === "critical" ? "danger" :
                              rule.severity === "warning"  ? "warning" : "success"
                            } className="text-[10px]">
                              {rule.severity === "critical" ? "Exceeded" :
                               rule.severity === "warning"  ? "Warning"  : "OK"}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Shell>
  );
}
