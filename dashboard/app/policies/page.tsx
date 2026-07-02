"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Shield, Plus, Trash2, RefreshCw, ArrowRight,
  Brain, Zap, Clock, DollarSign,
} from "lucide-react";

// ─── Policy type ──────────────────────────────────────────────────────────────

interface RoutingPolicy {
  id: string;
  name: string;
  trigger: "budget_pct" | "latency_ms" | "error_rate" | "time_of_day";
  triggerValue: string;
  fromModel: string;
  toModel: string;
  priority: "plan_type" | "always" | "peak_only";
  active: boolean;
  createdAt: string;
}

const MOCK_POLICIES: RoutingPolicy[] = [
  {
    id: "pol_001", name: "Budget Overflow Route",
    trigger: "budget_pct", triggerValue: "90",
    fromModel: "gpt-4o", toModel: "gpt-4o-mini",
    priority: "always", active: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "pol_002", name: "Peak Hours Downgrade",
    trigger: "time_of_day", triggerValue: "09:00-17:00",
    fromModel: "claude-opus-4-6", toModel: "claude-haiku-4-5",
    priority: "peak_only", active: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "pol_003", name: "High Latency Fallback",
    trigger: "latency_ms", triggerValue: "5000",
    fromModel: "gpt-4o", toModel: "gemini-2.0-flash",
    priority: "always", active: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const triggerConfig: Record<RoutingPolicy["trigger"], { label: string; icon: React.ElementType; unit: string }> = {
  budget_pct:  { label: "Budget %",       icon: DollarSign, unit: "%" },
  latency_ms:  { label: "Latency",        icon: Clock,      unit: "ms" },
  error_rate:  { label: "Error Rate",     icon: Zap,        unit: "%" },
  time_of_day: { label: "Time of Day",    icon: Clock,      unit: "" },
};

// ─── New policy form ──────────────────────────────────────────────────────────

function NewPolicyForm({ onClose, onSave }: {
  onClose: () => void;
  onSave: (p: RoutingPolicy) => void;
}) {
  const [form, setForm] = React.useState({
    name: "", trigger: "budget_pct", triggerValue: "90",
    fromModel: "gpt-4o", toModel: "gpt-4o-mini", priority: "always",
  });
  const [error, setError] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())       { setError("Name is required"); return; }
    if (!form.fromModel.trim())  { setError("Source model is required"); return; }
    if (!form.toModel.trim())    { setError("Fallback model is required"); return; }
    onSave({
      id: `pol_${Date.now()}`,
      name:         form.name.trim(),
      trigger:      form.trigger as RoutingPolicy["trigger"],
      triggerValue: form.triggerValue,
      fromModel:    form.fromModel.trim(),
      toModel:      form.toModel.trim(),
      priority:     form.priority as RoutingPolicy["priority"],
      active:       true,
      createdAt:    new Date().toISOString(),
    });
    onClose();
  }

  const sel = "w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary";
  const lbl = "text-[11px] text-meridian-text-muted mb-1 block";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="border-b border-meridian-border px-6 py-5 bg-meridian-bg-hover/30">
        <p className="text-sm font-medium text-meridian-text-primary mb-4">New Routing Policy</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl}>Policy Name</label>
            <Input className="h-8 text-xs" placeholder="e.g. Budget Overflow"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Trigger</label>
            <select className={sel} value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
              <option value="budget_pct">Budget %</option>
              <option value="latency_ms">Latency (ms)</option>
              <option value="error_rate">Error Rate %</option>
              <option value="time_of_day">Time of Day</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Trigger Value</label>
            <Input className="h-8 text-xs" placeholder="e.g. 90"
              value={form.triggerValue} onChange={(e) => setForm({ ...form, triggerValue: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>From Model</label>
            <Input className="h-8 text-xs" placeholder="gpt-4o"
              value={form.fromModel} onChange={(e) => setForm({ ...form, fromModel: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>To Model (Fallback)</label>
            <Input className="h-8 text-xs" placeholder="gpt-4o-mini"
              value={form.toModel} onChange={(e) => setForm({ ...form, toModel: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Apply To</label>
            <select className={sel} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="always">Always</option>
              <option value="plan_type">By plan type</option>
              <option value="peak_only">Peak hours only</option>
            </select>
          </div>
        </div>
        {error && <p className="text-xs text-chart-red mb-3">{error}</p>}
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" type="submit">Save Policy</Button>
          <Button variant="ghost"   size="sm" type="button" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const [policies, setPolicies] = React.useState<RoutingPolicy[]>(MOCK_POLICIES);
  const [showForm, setShowForm] = React.useState(false);

  function toggleActive(id: string) {
    setPolicies((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  }

  function handleDelete(id: string) {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  }

  const active   = policies.filter((p) => p.active).length;
  const inactive = policies.filter((p) => !p.active).length;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Policies</h1>
          <p className="text-sm text-meridian-text-muted">
            {active} active routing polic{active !== 1 ? "ies" : "y"}
            {inactive > 0 ? ` · ${inactive} disabled` : ""}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Policy
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Policies",  value: String(active),   bg: "bg-chart-green/10",  text: "text-chart-green",  icon: Shield   },
          { label: "Disabled",         value: String(inactive), bg: "bg-meridian-bg-hover", text: "text-meridian-text-muted", icon: Shield },
          { label: "Budget Triggers",  value: String(policies.filter((p) => p.trigger === "budget_pct").length),  bg: "bg-chart-orange/10", text: "text-chart-orange", icon: DollarSign },
          { label: "Latency Triggers", value: String(policies.filter((p) => p.trigger === "latency_ms").length),  bg: "bg-chart-blue/10",   text: "text-chart-blue",   icon: Clock      },
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

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Routing Policies</CardTitle>
          <CardDescription>
            Automatically route requests to fallback models when a trigger condition is met
          </CardDescription>
        </CardHeader>

        <AnimatePresence>
          {showForm && (
            <NewPolicyForm
              onClose={() => setShowForm(false)}
              onSave={(p) => { setPolicies((prev) => [p, ...prev]); setShowForm(false); }}
            />
          )}
        </AnimatePresence>

        <CardContent className="p-0">
          {policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                <Shield className="w-8 h-8 text-meridian-text-muted" />
              </div>
              <p className="text-sm font-medium text-meridian-text-secondary mb-1">No policies yet</p>
              <p className="text-xs text-meridian-text-muted mb-4">
                Create a routing policy to automatically handle budget or latency breaches
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Policy
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Apply To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {policies.map((p, i) => {
                    const trig = triggerConfig[p.trigger];
                    const TIcon = trig.icon;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          "border-b border-meridian-border transition-colors hover:bg-meridian-bg-hover/50",
                          !p.active && "opacity-50"
                        )}
                      >
                        <TableCell className="font-medium text-sm">{p.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TIcon className="w-3.5 h-3.5 text-meridian-text-muted" />
                            <span className="text-xs text-meridian-text-secondary">
                              {trig.label} &gt; {p.triggerValue}{trig.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <code className="bg-meridian-bg-hover px-1.5 py-0.5 rounded text-meridian-text-primary text-[11px]">
                              {p.fromModel}
                            </code>
                            <ArrowRight className="w-3 h-3 text-meridian-text-muted" />
                            <code className="bg-chart-blue/10 px-1.5 py-0.5 rounded text-chart-blue text-[11px]">
                              {p.toModel}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-[10px] capitalize">
                            {p.priority.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.active ? "success" : "default"} className="text-[10px]">
                            {p.active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleActive(p.id)}
                              className="text-[11px] px-2 py-1 rounded-lg hover:bg-meridian-bg-hover transition-colors text-meridian-text-muted hover:text-meridian-text-primary"
                            >
                              {p.active ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-lg hover:bg-chart-red/10 text-meridian-text-muted hover:text-chart-red transition-colors"
                              aria-label="Delete policy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
    </Shell>
  );
}
