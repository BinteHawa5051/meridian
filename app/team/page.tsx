"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { hasRole } from "@/lib/rbac";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  Users, Plus, Trash2, RefreshCw, Shield,
  CheckCircle2, Clock, UserX, Mail,
} from "lucide-react";

interface Member {
  id: string; name: string; email: string;
  role: string; active: boolean;
  last_login_at: string | null; created_at: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = hasRole(user?.role as any, "admin");

  const [members, setMembers]   = React.useState<Member[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", role: "user" });
  const [saving, setSaving]     = React.useState(false);
  const [error, setError]       = React.useState("");
  const [newPass, setNewPass]   = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/meridian/team");
      const d = await r.json();
      if (d.members) setMembers(d.members);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  React.useEffect(() => { load(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const r = await fetch("/api/meridian/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, memberRole: form.role }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed");
      setNewPass(d.tempPassword);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  async function changeRole(id: string, newRole: string) {
    await fetch("/api/meridian/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newRole }),
    });
    await load();
  }

  async function removeMember(id: string) {
    await fetch("/api/meridian/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const roleColor: Record<string, "primary" | "success" | "default"> = {
    admin: "primary", user: "success", viewer: "default",
  };

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Team</h1>
          <p className="text-sm text-meridian-text-muted">
            {members.filter((m) => m.active).length} active member{members.filter((m) => m.active).length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Invite Member
          </Button>
        )}
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Members",   value: String(members.length),                                        icon: Users,        bg: "bg-chart-blue/10",   text: "text-chart-blue"   },
          { label: "Admins",          value: String(members.filter((m) => m.role === "admin").length),      icon: Shield,       bg: "bg-meridian-burgundy/10", text: "text-meridian-burgundy-bright" },
          { label: "Active Today",    value: String(members.filter((m) => m.last_login_at).length),         icon: CheckCircle2, bg: "bg-chart-green/10",  text: "text-chart-green"  },
          { label: "Never Logged In", value: String(members.filter((m) => !m.last_login_at).length),        icon: Clock,        bg: "bg-chart-orange/10", text: "text-chart-orange" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-panel-hover p-5">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.text)} />
            </div>
            <p className="text-xl font-semibold tabular-nums text-meridian-text-primary">{s.value}</p>
            <p className="text-xs text-meridian-text-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Temp password banner */}
      <AnimatePresence>
        {newPass && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-4 rounded-xl bg-chart-green/5 border border-chart-green/20 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-chart-green mb-1">Member invited — share this temporary password</p>
              <code className="text-xs font-mono bg-meridian-bg-hover px-3 py-1.5 rounded-lg text-meridian-text-primary">{newPass}</code>
              <p className="text-[11px] text-meridian-text-muted mt-1">They should change it on first login</p>
            </div>
            <button onClick={() => setNewPass(null)} className="text-meridian-text-muted hover:text-meridian-text-primary text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage who has access to your Meridian workspace</CardDescription>
        </CardHeader>

        {/* Invite form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <form onSubmit={handleInvite} className="border-b border-meridian-border px-6 py-5 bg-meridian-bg-hover/30">
                <p className="text-sm font-medium text-meridian-text-primary mb-4">Invite Team Member</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Full Name</label>
                    <Input className="h-8 text-xs" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Email</label>
                    <Input className="h-8 text-xs" type="email" placeholder="jane@acme.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-[11px] text-meridian-text-muted mb-1 block">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full h-8 text-xs rounded-xl bg-meridian-bg-hover border border-meridian-border px-2 text-meridian-text-primary">
                      <option value="viewer">Viewer</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-xs text-chart-red mb-3">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" type="submit" disabled={saving}>
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                    Send Invite
                  </Button>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdmin && <TableHead className="w-24" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-meridian-bg-hover flex items-center justify-center text-xs font-semibold text-meridian-text-secondary">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-meridian-text-primary">{m.name}</p>
                          <p className="text-[11px] text-meridian-text-muted">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin && m.id !== user?.id ? (
                        <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}
                          className="text-xs rounded-lg bg-meridian-bg-hover border border-meridian-border px-2 py-1 text-meridian-text-primary">
                          <option value="viewer">Viewer</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <Badge variant={roleColor[m.role] ?? "default"} className="text-[10px] capitalize">{m.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.active ? "success" : "danger"} className="text-[10px]">
                        {m.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-meridian-text-muted">
                      {m.last_login_at ? formatRelativeTime(new Date(m.last_login_at)) : "Never"}
                    </TableCell>
                    <TableCell className="text-xs text-meridian-text-muted">
                      {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {m.id !== user?.id && (
                          <button onClick={() => removeMember(m.id)}
                            className="p-1.5 rounded-lg hover:bg-chart-red/10 text-meridian-text-muted hover:text-chart-red transition-colors"
                            aria-label="Remove member">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
