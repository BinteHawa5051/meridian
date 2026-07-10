"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search, Bell, Moon, Sun, BookOpen, Plus,
  Calendar, ChevronDown, Settings, LogOut,
  Key, User, ExternalLink, AlertTriangle,
  CheckCircle2, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ─── Date ranges ──────────────────────────────────────────────────────────────

const DATE_RANGES = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
] as const;

// ─── Search items ─────────────────────────────────────────────────────────────

const SEARCH_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",    category: "Pages"   },
  { label: "Customers",    href: "/customers",    category: "Pages"   },
  { label: "Usage",        href: "/usage",        category: "Pages"   },
  { label: "Models",       href: "/models",       category: "Pages"   },
  { label: "Budgets",      href: "/budgets",      category: "Pages"   },
  { label: "Policies",     href: "/policies",     category: "Pages"   },
  { label: "Alerts",       href: "/alerts",       category: "Pages"   },
  { label: "Billing",      href: "/billing",      category: "Pages"   },
  { label: "API Keys",     href: "/api-keys",     category: "Pages"   },
  { label: "Reports",      href: "/reports",      category: "Pages"   },
  { label: "Integrations", href: "/integrations", category: "Pages"   },
  { label: "Settings",     href: "/settings",     category: "Pages"   },
];

// ─── Mock notifications ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: "n1", title: "Budget exceeded",       body: "Acme Corp hit 100% of their monthly budget",    time: "2m ago",  severity: "critical", read: false },
  { id: "n2", title: "Anomaly detected",      body: "GPT-4o spend is 3.2σ above baseline today",     time: "18m ago", severity: "warning",  read: false },
  { id: "n3", title: "Invoice generated",     body: "Invoice #INV-284 sent to TechFlow Inc — $4,200", time: "1h ago",  severity: "success",  read: false },
  { id: "n4", title: "Model auto-switched",   body: "Claude Opus → Haiku for NovaSoft (budget 95%)", time: "3h ago",  severity: "info",     read: true  },
  { id: "n5", title: "API key created",       body: "New production key created by admin",            time: "5h ago",  severity: "info",     read: true  },
];

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────

function Dropdown({
  open, onClose, children, align = "right",
}: {
  open: boolean; onClose: () => void;
  children: React.ReactNode; align?: "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 z-[100] bg-[#141416] border border-[#27272a] rounded-xl shadow-2xl",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

export function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, dateRange, setDateRange } = useDashboardStore();

  // Search
  const [searchQuery, setSearchQuery]   = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Dropdowns
  const [dateOpen,    setDateOpen]    = React.useState(false);
  const [notifsOpen,  setNotifsOpen]  = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  // Notifications state
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dark mode toggle (visual only — already dark, could toggle class in future)
  const [isDark, setIsDark] = React.useState(true);

  // Filtered search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_ITEMS.filter((i) => i.label.toLowerCase().includes(q));
  }, [searchQuery]);

  function handleSearchSelect(href: string) {
    setSearchQuery("");
    setSearchFocused(false);
    searchRef.current?.blur();
    router.push(href);
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSearchSelect(searchResults[0].href);
    }
    if (e.key === "Escape") {
      setSearchQuery("");
      setSearchFocused(false);
      searchRef.current?.blur();
    }
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismissNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const notifColors: Record<string, string> = {
    critical: "text-[#EF4444]",
    warning:  "text-[#F97316]",
    success:  "text-[#10B981]",
    info:     "text-[#3B82F6]",
  };
  const notifIcons: Record<string, React.ElementType> = {
    critical: AlertTriangle,
    warning:  AlertTriangle,
    success:  CheckCircle2,
    info:     Bell,
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-[#09090b]/90 backdrop-blur-xl border-b border-[#27272a] transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[260px]"
      )}
    >
      <div className="flex items-center justify-between h-full px-6 gap-4">

        {/* ── Search ────────────────────────────────────────────────── */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A] pointer-events-none" />
          <Input
            ref={searchRef}
            placeholder="Search pages…  ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={handleSearchKey}
            className="pl-9 h-9 text-sm bg-[#1a1a1d] border-[#27272a] hover:border-[#3f3f46] focus:border-[#7A1F34]/60 focus:ring-0"
          />
          <AnimatePresence>
            {searchFocused && (searchQuery.length > 0 || true) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full mt-1.5 left-0 right-0 bg-[#141416] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden z-[100]"
              >
                {searchQuery.length === 0 ? (
                  <div className="p-3">
                    <p className="text-[10px] text-[#71717A] uppercase tracking-wider mb-2 px-1">Quick navigation</p>
                    {SEARCH_ITEMS.slice(0, 6).map((item) => (
                      <button
                        key={item.href}
                        onMouseDown={() => handleSearchSelect(item.href)}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors text-left"
                      >
                        <span className="text-sm text-[#A1A1AA]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((item) => (
                      <button
                        key={item.href}
                        onMouseDown={() => handleSearchSelect(item.href)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors text-left"
                      >
                        <span className="text-sm text-[#F5F5F5]">{item.label}</span>
                        <span className="text-[10px] text-[#71717A]">{item.category}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-[#71717A]">No results for "{searchQuery}"</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Date range picker */}
          <Dropdown open={dateOpen} onClose={() => setDateOpen(false)}>
            <button
              onClick={() => { setDateOpen((v) => !v); setNotifsOpen(false); setProfileOpen(false); }}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl hover:bg-[#1a1a1d] transition-colors text-xs text-[#A1A1AA]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {DATE_RANGES.find((d) => d.value === dateRange)?.label}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="w-48 p-1.5">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => { setDateRange(range.value); setDateOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    dateRange === range.value
                      ? "bg-[#7A1F34]/20 text-[#A52D4F]"
                      : "text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1a1a1d]"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </Dropdown>

          {/* Notifications */}
          <Dropdown open={notifsOpen} onClose={() => setNotifsOpen(false)}>
            <button
              onClick={() => { setNotifsOpen((v) => !v); setDateOpen(false); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-[#1a1a1d] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#A1A1AA]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#7A1F34] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-80">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
                <p className="text-sm font-semibold text-[#F5F5F5]">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-[#7A1F34] hover:text-[#A52D4F] transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-[#71717A]">No notifications</div>
                ) : (
                  notifications.map((n) => {
                    const NIcon = notifIcons[n.severity];
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-[#1a1a1d] transition-colors border-b border-[#1a1a1d] last:border-0",
                          !n.read && "bg-[#7A1F34]/5"
                        )}
                      >
                        <NIcon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", notifColors[n.severity])} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-medium", n.read ? "text-[#A1A1AA]" : "text-[#F5F5F5]")}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-0.5 leading-relaxed">{n.body}</p>
                          <p className="text-[10px] text-[#52525b] mt-1">{n.time}</p>
                        </div>
                        <button
                          onClick={() => dismissNotif(n.id)}
                          className="p-0.5 rounded hover:bg-[#27272a] text-[#52525b] hover:text-[#A1A1AA] transition-colors shrink-0"
                          aria-label="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-[#27272a]">
                <Link
                  href="/alerts"
                  onClick={() => setNotifsOpen(false)}
                  className="text-xs text-[#7A1F34] hover:text-[#A52D4F] transition-colors"
                >
                  View all alerts →
                </Link>
              </div>
            </div>
          </Dropdown>

          {/* Docs */}
          <a
            href="https://meridian.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-xl hover:bg-[#1a1a1d] transition-colors"
            aria-label="Documentation"
          >
            <BookOpen className="w-4 h-4 text-[#A1A1AA]" />
          </a>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="p-2 rounded-xl hover:bg-[#1a1a1d] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark
              ? <Moon className="w-4 h-4 text-[#A1A1AA]" />
              : <Sun  className="w-4 h-4 text-[#A1A1AA]" />}
          </button>

          <div className="w-px h-5 bg-[#27272a] mx-1" />

          {/* New API Key */}
          <Button
            variant="primary"
            size="sm"
            className="hidden sm:flex gap-1.5 text-xs h-8"
            onClick={() => router.push("/api-keys")}
          >
            <Plus className="w-3.5 h-3.5" />
            API Key
          </Button>

          {/* Profile dropdown */}
          <Dropdown open={profileOpen} onClose={() => setProfileOpen(false)}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setDateOpen(false); setNotifsOpen(false); }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-[#1a1a1d] transition-colors"
              aria-label="User menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] bg-[#7A1F34] text-white">
                  {user ? user.name.slice(0,2).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-xs font-medium text-[#A1A1AA]">
                {user?.name.split(" ")[0] ?? "Account"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#71717A] hidden sm:block" />
            </button>
            <div className="w-56">
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-[#27272a]">
                <p className="text-sm font-semibold text-[#F5F5F5]">{user?.name ?? "Account"}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{user?.email ?? ""}</p>
                <Badge variant="primary" className="mt-1.5 text-[10px] capitalize">{user?.role ?? "user"}</Badge>
              </div>
              {/* Menu items */}
              <div className="p-1.5">
                {[
                  { icon: User,     label: "Profile",      href: "/settings"      },
                  { icon: Settings, label: "Settings",     href: "/settings"      },
                  { icon: Key,      label: "API Keys",     href: "/api-keys"      },
                  { icon: BookOpen, label: "Documentation", href: "https://meridian.dev/docs", external: true },
                ].map((item) => (
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors w-full text-left"
                    >
                      <item.icon className="w-3.5 h-3.5 text-[#71717A]" />
                      <span className="text-sm text-[#A1A1AA]">{item.label}</span>
                      <ExternalLink className="w-3 h-3 text-[#52525b] ml-auto" />
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] transition-colors"
                    >
                      <item.icon className="w-3.5 h-3.5 text-[#71717A]" />
                      <span className="text-sm text-[#A1A1AA]">{item.label}</span>
                    </Link>
                  )
                ))}
              </div>
              {/* Logout */}
              <div className="p-1.5 border-t border-[#27272a]">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#EF4444]/10 transition-colors w-full text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span className="text-sm text-[#EF4444]">Sign out</span>
                </button>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
