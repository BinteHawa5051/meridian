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
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Bell, Plus, RefreshCw, Mail, Webhook, BellRing,
  AlertTriangle, CheckCircle2, XCircle, Trash2, Edit2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertRule {
  id:              string;
  dimension:       "total" | "customer" | "feature" | "model";
  dimensionValue:  string | null;
  thresholdUsd:    number;
  window:          "1h" | "24h" | "7d" | "month";
  channel:         "email" | "slack" | "webhook" | "pagerduty";
  destination:     string;
  lastFiredAt:     string | null;
  cooldownSeconds: number;
}

// ─── Mock alert rules (replaced by real DB when alert_rules table has data) ──

const MOCK_RULES: AlertRule[] = [
  {
    id: "ar_001", dimension: "total", dimensionValue: null,
    thresholdUsd: 1000, window: "24h", channel: "email",
    destination: "admin@acme.com", lastFiredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    cooldownSeconds: 3600,
  },
  {
    id: "ar_002", dimension: "customer", dimensionValue: "Acme Corp",
    thresholdUsd: 500, window: "24h", channel: "slack",
    destination: "#alerts", lastFiredAt: null, cooldownSeconds: 7200,
  },
  {
    id: "ar_003", dimension: "feature", dimensionValue: "summarize",
    thresholdUsd: 200, window: "1h", channel: "webhook",
    destination: "https://hooks.example.com/meridian", lastFiredAt: new Date(Date.now() - 86400000).toISOString(),
    cooldownSeconds: 1800,
  },
  {
    id: "ar_004", dimension: "model", dimensionValue: "gpt-4o",
    thresholdUsd: 5000, window: "month", channel: "email",
    destination: "cto@acme.com", lastFiredAt: null, cooldownSeconds: 86400,
  },
];

// ─── Channel icons ────────────────────────────────────────────────────────────

const channelConfig: Record<AlertRule["channel"], { icon: React.ElementType; label: string; color: string }> = {
  email:      { icon: Mail,     label: "Email",      color: "text-chart-blue"   },
  slack:      { icon: BellRing, label: "Slack",      color: "text-chart-purple" },
  webhook:    { icon: Webhook,  label: "Webhook",    color: "text-chart-orange" },
  pagerduty:  { icon: AlertTriangle, label: "PagerDuty", color: "text-chart-red" },
};

// ─── New alert form ────────────────────────────────────────────────────────────

function NewAlertForm({ onClose, onSave }: { onClose: () => void; onSave: (rule: AlertRule) => void }) {
  const [form, setForm] = React.useState({
    dimension: "total", dimensionValue: "", thresholdUsd: "",
    window: "24h", channel: "email", destination: "", cooldownSeconds: "3600",
  });
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.thresholdUsd) { setError("Threshold is required"); return; }
    if (!form.destination)  { setError("Destination is required"); return; }
    setSaving(true);
    setError("");

    try {
      // POST to alert_rules table
      const res = await fetch("/api/meridian/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: "00000000-0000-0000-0000-000000000000",
          dimension: form.dimension,
          dimensionValue: form.dimensionValue || null,
          thresholdUsd: parseFloat(form.thresholdUsd),
          window: form.window,
          channel: form.channel,
          destination: form.destination,
          cooldownSeconds: parseInt(form.cooldownSeconds),
        }),
      });

      const newRule: AlertRule = {
        id: `ar_${Date.now()}`,
        dimension:       form.dimension as AlertRule["dimension"],
        dimensionValue:  form.dimensionValue || null,
        thresholdUsd:    parseFloat(form.thresholdUsd),
        window:          form.window as AlertRule["window"],
        channel:         form.channel as AlertRule["channel"],
        destination:     form.destination,
        lastFiredAt:     null,
        cooldownSeconds: parseInt(form.cooldownSeconds),
      };
      onSave(newRule);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-8 text-xs bg-meridian-bg-hover border-meridian-border";
  const labelClass = "text-[11px] text-meridian-text-muted mb-1 block";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="border-b border-meridian-border px-6 py-5 bg-meridian-bg-hover/30">
        <p className="text-sm font-medium text-meridian-text-primary mb-4">New Alert Rule</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div>
            <label className={labelClass}>Dimension</label>
            <select
              value={form.dimension}
              onChange={(e) => setForm({ ...form, dimension: e.target.value })}
              className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
            >
              <option value="total">Total</option>
              <option value="customer">Customer</option>
              <option value="feature">Feature</option>
              <option value="model">Model</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Dimension Value</label>
            <Input className={inputClass} placeholder="e.g. Acme Corp"
              value={form.dimensionValue} onChange={(e) => setForm({ ...form, dimensionValue: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Threshold ($)</label>
            <Input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 500"
              value={form.thresholdUsd} onChange={(e) => setForm({ ...form, thresholdUsd: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Window</label>
            <select
              value={form.window}
              onChange={(e) => setForm({ ...form, window: e.target.value })}
              className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
            >
              <option value="1h">1 hour</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Channel</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="webhook">Webhook</option>
              <option value="pagerduty">PagerDuty</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Destination</label>
            <Input className={inputClass} placeholder="email or URL"
              value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-40">
            <label className={labelClass}>Cooldown (seconds)</label>
            <Input className={inputClass} type="number" min="60"
              value={form.cooldownSeconds} onChange={(e) => setForm({ ...form, cooldownSeconds: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-xs text-chart-red mb-3">{error}</p>}
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Save Alert Rule
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [rules, setRules] = React.useState<AlertRule[]>(MOCK_RULES);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Load real rules on mount
  React.useEffect(() => {
    fetch("/api/meridian/alerts")
      .then((r) => r.json())
      .then((d) => { if (d.rules?.length) setRules(d.rules); })
      .catch(() => { /* keep mock */ })
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSave(rule: AlertRule) {
    setRules((prev) => [...prev, rule]);
  }

  const lastFiredCount = rules.filter((r) => r.lastFiredAt).length;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Alerts</h1>
          <p className="text-sm text-meridian-text-muted">
            {rules.length} alert rule{rules.length !== 1 ? "s" : ""}
            {lastFiredCount > 0 && ` · ${lastFiredCount} fired recently`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Alert Rule
        </Button>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Rules",     value: String(rules.length),                                       color: "blue",   icon: Bell          },
          { label: "Fired Recently",  value: String(lastFiredCount),                                     color: "orange", icon: BellRing      },
          { label: "Email Channels",  value: String(rules.filter((r) => r.channel === "email").length),  color: "green",  icon: Mail          },
          { label: "Webhook Channels",value: String(rules.filter((r) => r.channel === "webhook").length),color: "purple", icon: Webhook       },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel-hover p-5"
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
              s.color === "blue"   ? "bg-chart-blue/10"   :
              s.color === "orange" ? "bg-chart-orange/10" :
              s.color === "green"  ? "bg-chart-green/10"  : "bg-chart-purple/10"
            )}>
              <s.icon className={cn("w-4 h-4",
                s.color === "blue"   ? "text-chart-blue"   :
                s.color === "orange" ? "text-chart-orange" :
                s.color === "green"  ? "text-chart-green"  : "text-chart-purple"
              )} />
            </div>
            <p className="text-xl font-semibold tabular-nums text-meridian-text-primary">{s.value}</p>
            <p className="text-xs text-meridian-text-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Alert Rules</CardTitle>
            <CardDescription>Triggered when spend exceeds threshold within the given window</CardDescription>
          </CardHeader>

          <AnimatePresence>
            {showForm && <NewAlertForm onClose={() => setShowForm(false)} onSave={handleSave} />}
          </AnimatePresence>

          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                  <Bell className="w-8 h-8 text-meridian-text-muted" />
                </div>
                <p className="text-sm font-medium text-meridian-text-secondary mb-1">No alert rules</p>
                <p className="text-xs text-meridian-text-muted mb-4">
                  Create a rule to get notified when spend spikes
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> New Alert Rule
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Cooldown</TableHead>
                    <TableHead>Last Fired</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule, i) => {
                    const ch = channelConfig[rule.channel];
                    const ChIcon = ch.icon;
                    const onCooldown = rule.lastFiredAt &&
                      (Date.now() - new Date(rule.lastFiredAt).getTime()) < rule.cooldownSeconds * 1000;

                    return (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <span className="text-xs font-medium capitalize text-meridian-text-primary">
                              {rule.dimension}
                            </span>
                            {rule.dimensionValue && (
                              <p className="text-[11px] text-meridian-text-muted">{rule.dimensionValue}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums font-medium">
                          {formatCurrency(rule.thresholdUsd)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-[10px]">{rule.window}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <ChIcon className={cn("w-3.5 h-3.5", ch.color)} />
                            <span className="text-xs capitalize text-meridian-text-secondary">{ch.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-meridian-text-muted font-mono truncate max-w-[160px] block">
                            {rule.destination}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-meridian-text-muted">
                            {rule.cooldownSeconds >= 3600
                              ? `${rule.cooldownSeconds / 3600}h`
                              : `${rule.cooldownSeconds / 60}m`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {rule.lastFiredAt ? (
                            <div className="flex items-center gap-1.5">
                              {onCooldown
                                ? <XCircle    className="w-3 h-3 text-chart-orange" />
                                : <CheckCircle2 className="w-3 h-3 text-chart-green" />}
                              <span className="text-[11px] text-meridian-text-muted">
                                {formatRelativeTime(new Date(rule.lastFiredAt))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-meridian-text-muted">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const updated = prompt(
                                  "Edit threshold ($):",
                                  String(rule.thresholdUsd)
                                );
                                if (updated !== null && !isNaN(parseFloat(updated))) {
                                  setRules((prev) =>
                                    prev.map((r) =>
                                      r.id === rule.id
                                        ? { ...r, thresholdUsd: parseFloat(updated) }
                                        : r
                                    )
                                  );
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-chart-blue/10 text-meridian-text-muted hover:text-chart-blue transition-colors"
                              aria-label="Edit rule"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id)}
                              className="p-1.5 rounded-lg hover:bg-chart-red/10 text-meridian-text-muted hover:text-chart-red transition-colors"
                              aria-label="Delete rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Shell>
  );
}
