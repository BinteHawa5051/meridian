"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatCompactNumber } from "@/lib/utils";
import { type FullCustomer } from "@/lib/api-client";
import {
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";

export type { FullCustomer as CustomerRow };

type SortKey = "name" | "revenue" | "aiCost" | "profit" | "margin" | "requests";
type SortDir = "asc" | "desc";

interface Props {
  customers: FullCustomer[];
  isLoading?: boolean;
}

const planBadge: Record<string, "primary" | "success" | "default"> = {
  enterprise: "primary",
  scale:      "success",
  starter:    "default",
  default:    "default",
};

const statusBadge: Record<string, "success" | "warning" | "danger"> = {
  active:   "success",
  "at-risk": "warning",
  churned:  "danger",
};

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ChevronDown className="w-3 h-3 opacity-20" />;
  return dir === "asc"
    ? <ChevronUp   className="w-3 h-3 text-meridian-burgundy-bright" />
    : <ChevronDown className="w-3 h-3 text-meridian-burgundy-bright" />;
}

export function CustomerTable({ customers, isLoading }: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>("revenue");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = React.useMemo(() => {
    return [...customers].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [customers, sortKey, sortDir]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: "name",     label: "Customer" },
    { key: "revenue",  label: "Revenue" },
    { key: "aiCost",   label: "AI Cost" },
    { key: "profit",   label: "Profit" },
    { key: "margin",   label: "Margin" },
    { key: "requests", label: "Requests" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map((c) => (
            <TableHead key={c.key}>
              <button
                onClick={() => handleSort(c.key)}
                className="flex items-center gap-1 hover:text-meridian-text-primary transition-colors"
              >
                {c.label}
                <SortIcon col={c.key} sortKey={sortKey} dir={sortDir} />
              </button>
            </TableHead>
          ))}
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence initial={false}>
          {sorted.map((c, i) => (
            <React.Fragment key={c.id}>
              <motion.tr
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className={cn(
                  "border-b border-meridian-border cursor-pointer transition-colors group/row",
                  expanded === c.id
                    ? "bg-meridian-bg-hover"
                    : "hover:bg-meridian-bg-hover/50"
                )}
              >
                {/* Customer name + avatar */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-meridian-bg-hover flex items-center justify-center text-xs font-semibold text-meridian-text-secondary group-hover/row:bg-meridian-burgundy/10 group-hover/row:text-meridian-burgundy-bright transition-all shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-meridian-text-primary text-sm">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-meridian-text-muted">
                        {c.externalId}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Revenue */}
                <TableCell className="tabular-nums font-medium">
                  {formatCurrency(c.revenue)}
                </TableCell>

                {/* AI Cost */}
                <TableCell className="tabular-nums text-meridian-text-secondary">
                  {formatCurrency(c.aiCost)}
                </TableCell>

                {/* Profit */}
                <TableCell>
                  <span className={cn(
                    "tabular-nums font-medium flex items-center gap-1",
                    c.profit >= 0 ? "text-chart-green" : "text-chart-red"
                  )}>
                    {c.profit >= 0
                      ? <ArrowUpRight   className="w-3.5 h-3.5 shrink-0" />
                      : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                    {formatCurrency(Math.abs(c.profit))}
                  </span>
                </TableCell>

                {/* Margin bar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          c.margin >= 20 ? "bg-chart-green" :
                          c.margin >= 0  ? "bg-chart-orange" : "bg-chart-red"
                        )}
                        style={{ width: `${Math.min(Math.abs(c.margin) * 2, 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-xs tabular-nums font-medium",
                      c.margin >= 20 ? "text-chart-green" :
                      c.margin >= 0  ? "text-chart-orange" : "text-chart-red"
                    )}>
                      {c.margin.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>

                {/* Requests */}
                <TableCell className="tabular-nums text-meridian-text-secondary text-sm">
                  {formatCompactNumber(c.requests)}
                </TableCell>

                {/* Plan */}
                <TableCell>
                  <Badge variant={planBadge[c.plan] ?? "default"} className="capitalize text-[10px]">
                    {c.plan}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={statusBadge[c.status]} className="capitalize text-[10px]">
                    {c.status}
                  </Badge>
                </TableCell>

                {/* Expand chevron */}
                <TableCell>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-meridian-text-muted transition-transform",
                      expanded === c.id && "rotate-180"
                    )}
                  />
                </TableCell>
              </motion.tr>

              {/* Expanded detail row */}
              <AnimatePresence>
                {expanded === c.id && (
                  <motion.tr
                    key={`${c.id}-detail`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-meridian-bg-hover/30 border-b border-meridian-border"
                  >
                    <TableCell colSpan={9} className="py-4 px-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[11px] text-meridian-text-muted mb-1">Customer ID</p>
                          <p className="text-xs font-mono text-meridian-text-secondary">{c.id}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-meridian-text-muted mb-1">Markup</p>
                          <p className="text-xs text-meridian-text-primary font-medium">
                            {(c.markup * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-meridian-text-muted mb-1">Stripe Customer</p>
                          {c.stripeCustomerId ? (
                            <a
                              href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-chart-blue hover:underline flex items-center gap-1"
                            >
                              {c.stripeCustomerId}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <p className="text-xs text-meridian-text-muted">Not connected</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-meridian-text-muted mb-1">Joined</p>
                          <p className="text-xs text-meridian-text-secondary">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </motion.tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}
