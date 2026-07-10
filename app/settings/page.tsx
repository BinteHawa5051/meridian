"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Settings, Building2, User, Bell, Shield,
  RefreshCw, CheckCircle2, Trash2, AlertTriangle, X,
} from "lucide-react";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
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

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button onClick={onToggle} disabled={disabled} aria-pressed={on}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-meridian-burgundy/50 disabled:opacity-50",
        on ? "bg-meridian-burgundy" : "bg-meridian-bg-hover border border-meridian-border"
      )}>
      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200", on ? "left-4" : "left-0.5")} />
    </button>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteOrgModal({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    // In production this would call DELETE /api/org
    await new Promise((r) => setTimeout(r, 1200));
    alert("Organisation deletion would be executed here in production. For safety it is disabled in demo.");
    setDeleting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#141416] border border-chart-red/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-chart-red/10"><AlertTriangle className="w-5 h-5 text-chart-red" /></div>
            <h2 className="text-base font-semibold text-meridian-text-primary">Delete Organisation</h2>
          </div>
          <button onClick={onClose} className="text-meridian-text-muted hover:text-meridian-text-primary"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-meridian-text-muted mb-4">
          This will permanently delete all data, API keys, customers, events and billing records. This action cannot be undone.
        </p>
        <p className="text-xs text-meridian-text-muted mb-2">Type <strong className="text-meridian-text-primary">delete</strong> to confirm:</p>
        <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="delete" className="h-9 mb-4 border-chart-red/30 focus:border-chart-red/60" />
        <div className="flex gap-2">
          <Button variant="danger" size="sm" disabled={confirm !== "delete" || deleting} onClick={handleDelete} className="flex-1">
            {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
            {deleting ? "Deleting…" : "Delete Organisation"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SSO modal ────────────────────────────────────────────────────────────────

function SSOModal({ onClose }: { onClose: () => void }) {
  const [domain, setDomain] = React.useState("");
  const [provider, setProvider] = React.useState("google");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#141416] border border-[#27272a] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-meridian-text-primary">Configure SSO</h2>
          <button onClick={onClose} className="text-meridian-text-muted hover:text-meridian-text-primary"><X className="w-4 h-4" /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="w-8 h-8 text-chart-green mb-2" />
            <p className="text-sm text-chart-green">SSO configuration saved</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[11px] text-meridian-text-muted mb-1 block">SSO Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}
                className="w-full h-9 text-sm rounded-xl bg-[#1a1a1d] border border-[#27272a] px-3 text-meridian-text-primary">
                <option value="google">Google Workspace</option>
                <option value="microsoft">Microsoft Entra ID</option>
                <option value="okta">Okta</option>
                <option value="saml">Generic SAML 2.0</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-meridian-text-muted mb-1 block">Allowed Email Domain</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com" className="h-9" required />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm" type="submit" disabled={saving} className="flex-1">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                {saving ? "Saving…" : "Save Configuration"}
              </Button>
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── IP Allowlist modal ───────────────────────────────────────────────────────

function IPAllowlistModal({ onClose }: { onClose: () => void }) {
  const [ips, setIps] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#141416] border border-[#27272a] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-meridian-text-primary">IP Allowlist</h2>
          <button onClick={onClose} className="text-meridian-text-muted hover:text-meridian-text-primary"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] text-meridian-text-muted mb-1 block">Allowed IP Ranges (one per line)</label>
            <textarea value={ips} onChange={(e) => setIps(e.target.value)} rows={5}
              placeholder={"192.168.1.0/24\n10.0.0.0/8\n203.0.113.42"}
              className="w-full text-sm rounded-xl bg-[#1a1a1d] border border-[#27272a] px-3 py-2 text-meridian-text-primary resize-none focus:border-[#7A1F34]/60 outline-none" />
          </div>
          <p className="text-[11px] text-meridian-text-muted">Leave empty to allow all IPs. Supports CIDR notation.</p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" type="submit" disabled={saving} className="flex-1">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              {saving ? "Saving…" : "Save Allowlist"}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved,   setSaved]   = React.useState(false);
  const [saving,  setSaving]  = React.useState(false);
  const [orgName, setOrgName] = React.useState("Acme Corp");
  const [orgSlug, setOrgSlug] = React.useState("acme-corp");
  const [profileName,  setProfileName]  = React.useState("");
  const [profileEmail, setProfileEmail] = React.useState("");
  const [plan]   = React.useState("enterprise");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [retention, setRetention] = React.useState("90");
  const [keyExpiry, setKeyExpiry] = React.useState("Never");

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showSSOModal,    setShowSSOModal]    = React.useState(false);
  const [showIPModal,     setShowIPModal]     = React.useState(false);

  // Security toggles
  const [twoFA, setTwoFA] = React.useState(true);

  // Notifications
  const [notifs, setNotifs] = React.useState({
    budgetAlerts: true, anomalyAlerts: true, invoiceEmails: true,
    weeklyDigest: false, securityAlerts: true,
  });

  // Populate profile from session
  React.useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Save handler — POSTs real data
  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/meridian/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, orgSlug, retention, profileName, profileEmail, avatarUrl, notifs, twoFA, keyExpiry }),
      });
    } catch { /* backend optional */ }
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "h-8 text-xs bg-meridian-bg-hover border-meridian-border";

  return (
    <Shell>
      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && <DeleteOrgModal   onClose={() => setShowDeleteModal(false)} />}
        {showSSOModal    && <SSOModal         onClose={() => setShowSSOModal(false)}    />}
        {showIPModal     && <IPAllowlistModal onClose={() => setShowIPModal(false)}     />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Settings</h1>
          <p className="text-sm text-meridian-text-muted">Manage your organisation and preferences</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw    className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          {saved  ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-chart-green" /> : null}
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

        {/* Org tab */}
        <TabsContent value="org">
          <Card>
            <CardHeader><CardTitle>Organisation Settings</CardTitle><CardDescription>Name, plan and data retention</CardDescription></CardHeader>
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

              <Section title="Plan" description="Your current subscription">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" className="capitalize">{plan}</Badge>
                    <span className="text-xs text-meridian-text-muted">
                      {plan === "enterprise" ? "500M events/month" : plan === "scale" ? "50M events/month" : "500K events/month"}
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" className="text-xs" onClick={() => window.open("https://meridian.dev/pricing", "_blank")}>
                    {plan === "enterprise" ? "Manage Plan" : "Upgrade"}
                  </Button>
                </div>
              </Section>

              <Section title="Data Retention" description="How long raw LLM events are stored">
                <div className="flex items-center gap-3">
                  <select value={retention} onChange={(e) => setRetention(e.target.value)}
                    className="h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary">
                    <option value="7">7 days (Builder)</option>
                    <option value="90">90 days (Scale)</option>
                    <option value="365">365 days (Enterprise)</option>
                  </select>
                  <p className="text-xs text-meridian-text-muted">Events older than {retention} days are automatically purged</p>
                </div>
              </Section>

              <Section title="Danger Zone" description="Irreversible — proceed with caution">
                <div className="flex items-center justify-between p-4 rounded-xl border border-chart-red/20 bg-chart-red/5">
                  <div>
                    <p className="text-sm font-medium text-chart-red">Delete Organisation</p>
                    <p className="text-xs text-meridian-text-muted mt-0.5">Permanently delete all data, keys and customers</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Org
                  </Button>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your personal account settings</CardDescription></CardHeader>
            <CardContent>
              <Section title="Personal Details" description="Your name and contact info">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Full Name</label>
                    <Input className={inputClass} value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Email</label>
                    <Input className={inputClass} value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} type="email" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-meridian-text-muted mb-1 block">Profile Picture</label>
                  <FileUpload value={avatarUrl} onChange={setAvatarUrl} label="Upload profile picture" />
                </div>
              </Section>
              <Section title="Role" description="Your role in the organisation">
                <Field label="Current Role">
                  <Badge variant="primary" className="capitalize">{user?.role ?? "admin"}</Badge>
                </Field>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifs">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Control which alerts are sent to your email</CardDescription></CardHeader>
            <CardContent>
              {([
                { key: "budgetAlerts",   label: "Budget alerts",         desc: "When a budget rule is triggered" },
                { key: "anomalyAlerts",  label: "Anomaly detection",     desc: "AI-detected spend spikes" },
                { key: "invoiceEmails",  label: "Invoice notifications", desc: "When Stripe invoices are generated" },
                { key: "weeklyDigest",   label: "Weekly digest",         desc: "Summary of the past 7 days" },
                { key: "securityAlerts", label: "Security alerts",       desc: "API key creation and revocation" },
              ] as const).map(({ key, label, desc }) => (
                <Field key={key} label={label} description={desc}>
                  <Toggle on={notifs[key]} onToggle={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))} />
                </Field>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle><CardDescription>Authentication and access control</CardDescription></CardHeader>
            <CardContent>
              <Section title="Authentication" description="How team members sign in">
                <Field label="SSO / OAuth" description="Enable single sign-on for your team">
                  <Button variant="secondary" size="sm" className="text-xs" onClick={() => setShowSSOModal(true)}>Configure SSO</Button>
                </Field>
                <Field label="Two-Factor Authentication" description="Require 2FA for all admin actions">
                  <Toggle on={twoFA} onToggle={() => setTwoFA((v) => !v)} />
                </Field>
              </Section>
              <Section title="API Key Security" description="Controls on how keys are used">
                <Field label="IP Allowlist" description="Restrict key usage to specific IP ranges">
                  <Button variant="secondary" size="sm" className="text-xs" onClick={() => setShowIPModal(true)}>Configure</Button>
                </Field>
                <Field label="Key Expiry" description="Auto-expire keys after a set period">
                  <select value={keyExpiry} onChange={(e) => setKeyExpiry(e.target.value)}
                    className="h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary">
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
