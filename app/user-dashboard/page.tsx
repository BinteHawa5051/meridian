"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, DollarSign, Activity, Clock,
  Zap, AlertCircle, CheckCircle, ArrowUpRight,
  Calendar, BarChart3, Users, Settings, User, Mail, Save, Edit2
} from "lucide-react";

// Mock user-specific data
const USER_STATS = [
  { label: "My Spend (30d)", value: "$1,234.56", change: "+12%", icon: DollarSign, color: "text-green-500" },
  { label: "API Requests", value: "45,678", change: "+23%", icon: Zap, color: "text-blue-500" },
  { label: "Avg Latency", value: "245ms", change: "-8%", icon: Clock, color: "text-purple-500" },
  { label: "Active Models", value: "8", change: "+2", icon: BarChart3, color: "text-orange-500" },
];

const RECENT_ACTIVITY = [
  { id: "1", type: "api_call", message: "GPT-4 API call successful", time: "2 min ago", status: "success" },
  { id: "2", type: "budget", message: "Budget alert: 80% of monthly limit reached", time: "1 hour ago", status: "warning" },
  { id: "3", type: "model", message: "New model Claude 3 Opus added to account", time: "3 hours ago", status: "success" },
  { id: "4", type: "api_call", message: "API rate limit exceeded", time: "5 hours ago", status: "error" },
];

const QUICK_ACTIONS = [
  { label: "View Usage", icon: BarChart3, href: "/usage", color: "bg-blue-500/10 text-blue-500" },
  { label: "Manage API Keys", icon: Settings, href: "/api-keys", color: "bg-purple-500/10 text-purple-500" },
  { label: "View Bills", icon: DollarSign, href: "/billing", color: "bg-green-500/10 text-green-500" },
  { label: "Team Settings", icon: Users, href: "/team", color: "bg-orange-500/10 text-orange-500" },
];

const USAGE_BREAKDOWN = [
  { model: "GPT-4", requests: 12500, cost: 450, percentage: 45 },
  { model: "Claude 3 Opus", requests: 8200, cost: 320, percentage: 32 },
  { model: "GPT-3.5 Turbo", requests: 25000, cost: 180, percentage: 18 },
  { model: "Other", requests: 5000, cost: 50, percentage: 5 },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Redirect non-logged-in users
  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSave = async () => {
    // In a real app, this would call an API to update user info
    setIsEditing(false);
    // Show success notification
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-16 h-16 text-meridian-burgundy mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-meridian-text-primary">
            My Profile
          </h1>
          <p className="text-meridian-text-muted mt-1">Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Profile Information Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-meridian-text-primary">Personal Information</h2>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-meridian-burgundy flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.substring(0, 2).toUpperCase() || "TA"}
            </div>
            <div>
              <h3 className="font-semibold text-meridian-text-primary text-lg">{user?.name || "User"}</h3>
              <Badge variant={user?.role === "admin" ? "primary" : "secondary"} className="capitalize mt-1">
                {user?.role || "user"}
              </Badge>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-sm font-medium text-meridian-text-primary mb-2 block">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-meridian-bg-hover border-meridian-border"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-meridian-bg-hover">
                  <User className="w-4 h-4 text-meridian-text-muted" />
                  <span className="text-meridian-text-primary">{user?.name || "Not set"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-meridian-text-primary mb-2 block">
                Email Address
              </label>
              {isEditing ? (
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  type="email"
                  className="bg-meridian-bg-hover border-meridian-border"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-meridian-bg-hover">
                  <Mail className="w-4 h-4 text-meridian-text-muted" />
                  <span className="text-meridian-text-primary">{user?.email || "Not set"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-meridian-text-primary mb-2 block">
                Role
              </label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-meridian-bg-hover">
                <Badge variant={user?.role === "admin" ? "primary" : "secondary"} className="capitalize">
                  {user?.role || "user"}
                </Badge>
                <span className="text-xs text-meridian-text-muted">Contact admin to change role</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-meridian-text-primary mb-2 block">
                Account Status
              </label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-meridian-bg-hover">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-meridian-text-primary">Active</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {USER_STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-meridian-text-muted mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-meridian-text-primary">{stat.value}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
                    )}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={cn("w-8 h-8", stat.color)} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(action.href)}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", action.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-meridian-text-primary">{action.label}</h3>
                    <ArrowUpRight className="w-4 h-4 text-meridian-text-muted ml-auto" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Usage Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-meridian-text-primary">Usage by Model</h2>
            <Button variant="ghost" size="sm">View Details</Button>
          </div>
          <div className="space-y-4">
            {USAGE_BREAKDOWN.map((item) => (
              <div key={item.model}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-meridian-text-primary">{item.model}</span>
                  <span className="text-sm text-meridian-text-muted">${item.cost} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-meridian-bg-hover rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-meridian-burgundy h-2 rounded-full"
                  />
                </div>
                <p className="text-xs text-meridian-text-muted mt-1">{item.requests.toLocaleString()} requests</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-meridian-text-primary">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((activity) => {
              const icons = {
                success: CheckCircle,
                warning: AlertCircle,
                error: AlertCircle,
              };
              const colors = {
                success: "text-green-500",
                warning: "text-yellow-500",
                error: "text-red-500",
              };
              const Icon = icons[activity.status];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-meridian-bg-hover"
                >
                  <Icon className={cn("w-5 h-5 mt-0.5", colors[activity.status])} />
                  <div className="flex-1">
                    <p className="text-sm text-meridian-text-primary">{activity.message}</p>
                    <p className="text-xs text-meridian-text-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Budget Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-meridian-text-primary">Budget Status</h2>
          <Badge variant="warning">80% Used</Badge>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-meridian-text-primary">Monthly Budget</span>
              <span className="text-sm text-meridian-text-muted">$1,234 / $1,500</span>
            </div>
            <div className="w-full bg-meridian-bg-hover rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 0.8 }}
                className="bg-yellow-500 h-3 rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-meridian-text-muted">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>You're approaching your monthly budget limit. Consider upgrading your plan.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
