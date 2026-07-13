"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useAuth } from "@/lib/auth-context";
import { canAccess } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import {
  ChevronLeft, ChevronRight, LayoutDashboard,
  Users, BarChart3, Brain, Wallet, Shield, Bell,
  CreditCard, Key, FileText, Puzzle, Settings,
  LogOut, ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  Wallet,
  Shield,
  Bell,
  CreditCard,
  Key,
  FileText,
  Puzzle,
  Settings,
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const { user, logout } = useAuth();
  const [orgExpanded, setOrgExpanded] = React.useState(true);

  React.useEffect(() => {
    for (const item of SIDEBAR_ITEMS) {
      router.prefetch(item.href);
    }
    router.prefetch("/settings");
    router.prefetch("/billing");
  }, [router]);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 72 : 260,
      }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="fixed left-0 top-0 z-40 h-screen bg-meridian-bg border-r border-meridian-border flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 shrink-0">
        <motion.div
          initial={false}
          animate={{ scale: sidebarCollapsed ? 0.8 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-meridian-burgundy flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold tracking-tight text-meridian-text-primary"
              >
                MERIDIAN
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const allowed  = canAccess(user?.role as Role | undefined, item.href);
          const isAdminOnly = (item as any).adminOnly === true;
          const isUserOnly = (item as any).userOnly === true;
          const isAdmin = user?.role === "admin";
          const isUser = user?.role === "user" || user?.role === "admin";

          // Hide admin-only items for non-admin users
          if (isAdminOnly && !isAdmin) return null;

          // Hide user-only items for non-user roles
          if (isUserOnly && !isUser) return null;

          return (
            <Link key={item.href} href={allowed ? item.href : "#"} prefetch={allowed}>
              <motion.div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive ? "text-meridian-text-primary dark:text-white" :
                  !allowed ? "text-meridian-text-muted/40 cursor-not-allowed" :
                  "text-meridian-text-muted hover:text-meridian-text-primary hover:bg-meridian-bg-hover"
                )}
                whileHover={allowed ? { x: 2 } : {}}
                whileTap={allowed ? { scale: 0.98 } : {}}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-meridian-burgundy/10 dark:bg-meridian-burgundy/20 rounded-xl border border-meridian-burgundy/20 dark:border-meridian-burgundy/30"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "flex items-center justify-center w-5 h-5 shrink-0 transition-colors",
                      isActive && "text-meridian-burgundy dark:text-meridian-burgundy-bright"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 p-3 border-t border-meridian-border">
        {/* Organization switcher */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 overflow-hidden"
            >
              <button
                onClick={() => setOrgExpanded(!orgExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-meridian-bg-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-meridian-burgundy to-meridian-burgundy-bright flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    A
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-meridian-text-primary">Acme Corp</p>
                    <p className="text-[10px] text-meridian-text-muted">Enterprise Plan</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-meridian-text-muted transition-transform duration-200",
                    orgExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Org menu items */}
              <AnimatePresence>
                {orgExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 pl-2 space-y-0.5">
                      <Link
                        href="/settings"
                        prefetch
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-meridian-bg-hover transition-colors text-xs text-meridian-text-muted hover:text-meridian-text-primary"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Org Settings
                      </Link>
                      <Link
                        href="/billing"
                        prefetch
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-meridian-bg-hover transition-colors text-xs text-meridian-text-muted hover:text-meridian-text-primary"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Billing
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User profile row */}
        <div className="relative group/profile">
          <Link
            href="/user-dashboard"
            prefetch
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-meridian-bg-hover transition-colors cursor-pointer"
          >
            <Avatar className="w-8 h-8 ring-2 ring-meridian-border group-hover/profile:ring-meridian-burgundy/40 transition-all shrink-0">
              <AvatarFallback className="bg-meridian-burgundy text-white text-xs">
                {user?.name?.substring(0, 2).toUpperCase() ?? "TA"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-meridian-text-primary truncate">{user?.name ?? "Account"}</p>
                  <p className="text-[11px] text-meridian-text-muted truncate capitalize">{user?.role ?? "user"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1 opacity-0 group-hover/profile:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2">
              <Link
                href="/settings"
                prefetch
                className="p-1 rounded-md hover:bg-meridian-bg text-meridian-text-muted hover:text-meridian-text-primary transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={logout}
                className="p-1 rounded-md hover:bg-chart-red/10 text-meridian-text-muted hover:text-chart-red transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center w-full mt-1 p-1.5 rounded-xl hover:bg-meridian-bg-hover transition-colors text-meridian-text-muted hover:text-meridian-text-primary"
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
