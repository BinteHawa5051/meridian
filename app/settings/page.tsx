"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Settings, Building2, User, Bell, Shield,
  RefreshCw, CheckCircle2, Trash2,
} from "lucide-react";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-meridian-border pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <div className="mb-4">
        <p className="text-sm font-medium text-meridian-text-primary">{title}</p>
        <p className="text-xs text-meridian-text-muted mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function Field({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-meridian-text-secondary">{label}</p>
        {description && <p className="text-[11px] text-meridian-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-meridian-burgundy/50",
        on ? "bg-meridian-burgundy" : "bg-meridian-bg-hover border border-meridian-border"
      )}
    >
      <span className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
        on ? "left-4" : "left-0.5"
      )} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Org settings state
  const [orgName, setOrgName] = React.useState("Acme Corp");
  const [orgSlug, setOrgSlug] = React.useState("acme-corp");
  const [plan, setPlan] = React.useState("enterprise");

  // Notification preferences
  const [notifs, setNotifs] = React.useState({
    budgetAlerts:   true,
    anomalyAlerts:  true,
    invoiceEmails:  true,
    weeklyDigest:   false,
    securityAlerts: true,
  });

  // Data retention
  const [retention, setRetention] = React.useState("90");

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "h-8 text-xs bg-meridian-bg-hover border-meridian-border";

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Settings</h1>
          <p className="text-sm text-meridian-text-muted">Manage your organisation and preferences</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving  ? <RefreshCw   className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          {saved   ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-chart-green" /> : null}
          {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </Button>
      </motion.div>

      <Tabs defaultValue="org" className="space-y-4">
        <TabsList>
          <TabsTrigger value="org"      className="text-xs gap-1.5"><Building2 className="w-3.5 h-3.5" />Organisation</TabsTrigger>
          <TabsTrigger value="profile"  className="text-xs gap-1.5"><User      className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="notifs"   className="text-xs gap-1.5"><Bell      className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5"><Shield    className="w-3.5 h-3.5" />Security</TabsTrigger>
        </TabsList>

        {/* ── Organisation ──────────────────────────────────────────── */}
        <TabsContent value="org">
          <Card>
            <CardHeader>
              <CardTitle>Organisation Settings</CardTitle>
              <CardDescription>Manage your org name, plan and data retention</CardDescription>
            </CardHeader>
            <CardContent>
              <Section title="General" description="Basic organisation details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Organisation Name</label>
                    <Input className={inputClass} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Slug</label>
                    <Input className={inputClass} value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
                  </div>
                </div>
              </Section>

              <Section title="Plan" description="Your current subscription plan">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" className="capitalize">{plan}</Badge>
                    <span className="text-xs text-meridian-text-muted">
                      {plan === "enterprise" ? "500M events/month" : plan === "scale" ? "50M events/month" : "500K events/month"}
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" className="text-xs">
                    {plan === "enterprise" ? "Manage Plan" : "Upgrade"}
                  </Button>
                </div>
              </Section>

              <Section title="Data Retention" description="How long raw LLM events are stored">
                <div className="flex items-center gap-3">
                  <select
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                    className="h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary"
                  >
                    <option value="7">7 days (Builder)</option>
                    <option value="90">90 days (Scale)</option>
                    <option value="365">365 days (Enterprise)</option>
                  </select>
                  <p className="text-xs text-meridian-text-muted">
                    Events older than {retention} days are automatically purged
                  </p>
                </div>
              </Section>

              <Section title="Danger Zone" description="Irreversible actions — proceed with caution">
                <div className="flex items-center justify-between p-4 rounded-xl border border-chart-red/20 bg-chart-red/5">
                  <div>
                    <p className="text-sm font-medium text-chart-red">Delete Organisation</p>
                    <p className="text-xs text-meridian-text-muted mt-0.5">
                      Permanently delete all data, keys and customers
                    </p>
                  </div>
                  <Button variant="danger" size="sm">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Org
                  </Button>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profile ───────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Section title="Personal Details" description="Your name and contact info">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Full Name</label>
                    <Input className={inputClass} defaultValue="Tooba Akram" />
                  </div>
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Email</label>
                    <Input className={inputClass} defaultValue="admin@acme.com" type="email" />
                  </div>
                </div>
              </Section>
              <Section title="Role" description="Your role in the organisation">
                <Field label="Current Role">
                  <Badge variant="primary">Admin</Badge>
                </Field>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ─────────────────────────────────────────── */}
        <TabsContent value="notifs">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which alerts are sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
              {(
                [
                  { key: "budgetAlerts",   label: "Budget alerts",          desc: "When a budget rule is triggered" },
                  { key: "anomalyAlerts",  label: "Anomaly detection",      desc: "AI-detected spend spikes" },
                  { key: "invoiceEmails",  label: "Invoice notifications",  desc: "When Stripe invoices are generated" },
                  { key: "weeklyDigest",   label: "Weekly digest",          desc: "Summary of the past 7 days" },
                  { key: "securityAlerts", label: "Security alerts",        desc: "API key creation and revocation" },
                ] as const
              ).map(({ key, label, desc }) => (
                <Field key={key} label={label} description={desc}>
                  <Toggle
                    on={notifs[key]}
                    onToggle={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                  />
                </Field>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ──────────────────────────────────────────────── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Authentication and access control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Section title="Authentication" description="How team members sign in">
                <Field label="SSO / OAuth" description="Enable single sign-on for your team">
                  <Button variant="secondary" size="sm" className="text-xs">Configure SSO</Button>
                </Field>
                <Field label="Two-Factor Authentication" description="Require 2FA for all admin actions">
                  <Toggle on={true} onToggle={() => {}} />
                </Field>
              </Section>
              <Section title="API Key Security" description="Controls on how keys are used">
                <Field label="IP Allowlist" description="Restrict key usage to specific IP ranges">
                  <Button variant="secondary" size="sm" className="text-xs">Configure</Button>
                </Field>
                <Field label="Key Expiry" description="Auto-expire keys after a set period">
                  <select className="h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary">
                    <option>Never</option>
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                </Field>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
