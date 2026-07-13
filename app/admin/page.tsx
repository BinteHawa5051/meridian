"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Activity, Database, Shield, Settings,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Server, Globe, DollarSign, Zap
} from "lucide-react";

// Mock data for admin dashboard
const SYSTEM_METRICS = [
  { label: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-blue-500" },
  { label: "Active Sessions", value: "89", change: "+5%", icon: Activity, color: "text-green-500" },
  { label: "Database Size", value: "2.4 GB", change: "+8%", icon: Database, color: "text-purple-500" },
  { label: "API Requests (24h)", value: "1.2M", change: "+23%", icon: Zap, color: "text-yellow-500" },
];

const SYSTEM_HEALTH = [
  { service: "API Server", status: "healthy", uptime: "99.9%", latency: "45ms" },
  { service: "Database", status: "healthy", uptime: "99.8%", latency: "12ms" },
  { service: "Redis Cache", status: "healthy", uptime: "99.9%", latency: "2ms" },
  { service: "Queue Worker", status: "degraded", uptime: "98.5%", latency: "150ms" },
];

const RECENT_USERS = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "admin", status: "active", joined: "2 hours ago" },
  { id: "2", name: "Sarah Johnson", email: "sarah@tech.com", role: "user", status: "active", joined: "5 hours ago" },
  { id: "3", name: "Mike Davis", email: "mike@startup.io", role: "user", status: "pending", joined: "1 day ago" },
  { id: "4", name: "Emily Brown", email: "emily@corp.com", role: "viewer", status: "active", joined: "2 days ago" },
];

const ALERTS = [
  { id: "1", type: "warning", message: "Queue worker latency elevated", time: "5 min ago" },
  { id: "2", type: "info", message: "Scheduled maintenance in 2 hours", time: "1 hour ago" },
  { id: "3", type: "success", message: "Database backup completed", time: "3 hours ago" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-meridian-burgundy mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-meridian-text-muted">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-meridian-text-primary">Admin Dashboard</h1>
          <p className="text-meridian-text-muted mt-1">System overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="primary" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SYSTEM_METRICS.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-meridian-text-muted mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-meridian-text-primary">{metric.value}</p>
                    <p className="text-xs text-green-500 mt-1">{metric.change}</p>
                  </div>
                  <Icon className={cn("w-8 h-8", metric.color)} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-meridian-text-primary">System Health</h2>
            <Badge variant="success">All Systems Operational</Badge>
          </div>
          <div className="space-y-3">
            {SYSTEM_HEALTH.map((service) => (
              <div
                key={service.service}
                className="flex items-center justify-between p-3 rounded-lg bg-meridian-bg-hover"
              >
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-meridian-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-meridian-text-primary">{service.service}</p>
                    <p className="text-xs text-meridian-text-muted">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={service.status === "healthy" ? "success" : "warning"}
                    className="mb-1"
                  >
                    {service.status}
                  </Badge>
                  <p className="text-xs text-meridian-text-muted">{service.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-meridian-text-primary">Recent Alerts</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {ALERTS.map((alert) => {
              const icons = {
                warning: AlertTriangle,
                info: Clock,
                success: CheckCircle,
              };
              const colors = {
                warning: "text-yellow-500",
                info: "text-blue-500",
                success: "text-green-500",
              };
              const Icon = icons[alert.type as keyof typeof icons];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-meridian-bg-hover"
                >
                  <Icon className={cn("w-5 h-5 mt-0.5", colors[alert.type as keyof typeof colors])} />
                  <div className="flex-1">
                    <p className="text-sm text-meridian-text-primary">{alert.message}</p>
                    <p className="text-xs text-meridian-text-muted mt-1">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* User Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-meridian-text-primary">Recent Users</h2>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-meridian-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-meridian-text-muted">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-meridian-text-muted">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-meridian-text-muted">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-meridian-text-muted">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-meridian-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_USERS.map((user) => (
                <tr key={user.id} className="border-b border-meridian-border/50 hover:bg-meridian-bg-hover">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-meridian-text-primary">{user.name}</p>
                      <p className="text-xs text-meridian-text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === "admin" ? "primary" : "secondary"} className="capitalize">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === "active" ? "success" : "warning"} className="capitalize">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-meridian-text-muted">{user.joined}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon-sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-meridian-text-primary">User Management</h3>
              <p className="text-sm text-meridian-text-muted">Manage users and roles</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-meridian-text-primary">Access Control</h3>
              <p className="text-sm text-meridian-text-muted">Configure permissions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-meridian-text-primary">Database</h3>
              <p className="text-sm text-meridian-text-muted">View logs and backups</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
