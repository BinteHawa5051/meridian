"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw,
  CheckCircle2, AlertTriangle, ShieldCheck,
} from "lucide-react";

interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  active: boolean;
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "key_mock_001",
    keyPrefix: "mr_live_1a2b",
    name: "Production API Key",
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: "key_mock_002",
    keyPrefix: "mr_test_7c8d",
    name: "Staging Key",
    lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: "key_mock_003",
    keyPrefix: "mr_live_9e0f",
    name: "Legacy Key",
    lastUsedAt: null,
    revokedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    active: false,
  },
];

// ─── New key reveal banner ─────────────────────────────────────────────────────

function NewKeyBanner({ rawKey, onDismiss }: { rawKey: string; onDismiss: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  function copy() {
    navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-6 p-4 rounded-xl bg-chart-green/5 border border-chart-green/20"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-chart-green mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-chart-green mb-1">
            New API key created — copy it now
          </p>
          <p className="text-xs text-meridian-text-muted mb-3">
            This key will <strong className="text-meridian-text-secondary">not be shown again</strong>. Store it securely.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-meridian-bg-hover px-3 py-2 rounded-lg text-meridian-text-primary truncate">
              {visible ? rawKey : rawKey.slice(0, 16) + "•".repeat(rawKey.length - 16)}
            </code>
            <Button variant="ghost" size="icon-sm" onClick={() => setVisible((v) => !v)} aria-label="Toggle visibility">
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy key">
              {copied
                ? <CheckCircle2 className="w-3.5 h-3.5 text-chart-green" />
                : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-meridian-text-muted hover:text-meridian-text-primary text-xs">
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateForm({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (rawKey: string, key: ApiKey) => void;
}) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/meridian/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          orgId: "00000000-0000-0000-0000-000000000000",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        keyPrefix: data.keyPrefix,
        name: name.trim(),
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
        active: true,
      };
      onCreate(data.key, newKey);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 border-b border-meridian-border bg-meridian-bg-hover/30">
        <p className="text-sm font-medium text-meridian-text-primary mb-4">Create New API Key</p>
        <div className="flex items-end gap-3 max-w-md">
          <div className="flex-1">
            <label className="text-[11px] text-meridian-text-muted mb-1 block">Key Name</label>
            <Input
              placeholder="e.g. Production, Staging, CI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <Button variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Create Key
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
        </div>
        {error && <p className="text-xs text-chart-red mt-2">{error}</p>}
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [newRawKey, setNewRawKey] = React.useState<string | null>(null);
  const [revoking, setRevoking] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/meridian/api-keys")
      .then((r) => r.json())
      .then((d) => { setKeys(d.keys?.length ? d.keys : MOCK_KEYS); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await fetch("/api/meridian/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setKeys((prev) =>
        prev.map((k) => k.id === id ? { ...k, active: false, revokedAt: new Date().toISOString() } : k)
      );
    } catch { /* ignore */ }
    setRevoking(null);
  }

  function handleCreate(rawKey: string, key: ApiKey) {
    setNewRawKey(rawKey);
    setKeys((prev) => [key, ...prev]);
  }

  const active  = keys.filter((k) => k.active).length;
  const revoked = keys.filter((k) => !k.active).length;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">API Keys</h1>
          <p className="text-sm text-meridian-text-muted">
            {loading ? "Loading…" : `${active} active · ${revoked} revoked`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New API Key
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Keys",       value: String(active),                                                         bg: "bg-chart-green/10",  text: "text-chart-green",  icon: Key          },
          { label: "Revoked Keys",      value: String(revoked),                                                        bg: "bg-chart-red/10",    text: "text-chart-red",    icon: AlertTriangle },
          { label: "Recently Used",     value: String(keys.filter((k) => k.lastUsedAt).length),                        bg: "bg-chart-blue/10",   text: "text-chart-blue",   icon: CheckCircle2 },
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

      {/* New key banner */}
      <AnimatePresence>
        {newRawKey && (
          <NewKeyBanner rawKey={newRawKey} onDismiss={() => setNewRawKey(null)} />
        )}
      </AnimatePresence>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Keys authenticate requests to the Meridian ingest API</CardDescription>
        </CardHeader>

        <AnimatePresence>
          {showForm && (
            <CreateForm onClose={() => setShowForm(false)} onCreate={handleCreate} />
          )}
        </AnimatePresence>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-meridian-bg-hover mb-4">
                <Key className="w-8 h-8 text-meridian-text-muted" />
              </div>
              <p className="text-sm font-medium text-meridian-text-secondary mb-1">No API keys yet</p>
              <p className="text-xs text-meridian-text-muted mb-4">Create a key to start ingesting LLM events</p>
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {keys.map((k, i) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "border-b border-meridian-border transition-colors",
                        k.active ? "hover:bg-meridian-bg-hover/50" : "opacity-50"
                      )}
                    >
                      <TableCell className="font-medium text-sm">{k.name}</TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-meridian-bg-hover px-2 py-1 rounded-lg text-meridian-text-secondary">
                          {k.keyPrefix}••••••••••••••••
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={k.active ? "success" : "danger"} className="text-[10px]">
                          {k.active ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-meridian-text-muted">
                        {k.lastUsedAt ? formatRelativeTime(new Date(k.lastUsedAt)) : "Never"}
                      </TableCell>
                      <TableCell className="text-xs text-meridian-text-muted">
                        {new Date(k.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {k.active && (
                          <button
                            onClick={() => handleRevoke(k.id)}
                            disabled={revoking === k.id}
                            className="p-1.5 rounded-lg hover:bg-chart-red/10 text-meridian-text-muted hover:text-chart-red transition-colors disabled:opacity-50"
                            aria-label="Revoke key"
                          >
                            {revoking === k.id
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
