"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUDGET_ENFORCEMENTS, type BudgetEnforcement } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ShieldBan,
  ArrowDown,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const actionConfig = {
  blocked: {
    icon: ShieldBan,
    label: "Blocked",
    variant: "danger" as const,
    description: "Requests rejected",
  },
  downgraded: {
    icon: ArrowDown,
    label: "Downgraded",
    variant: "warning" as const,
    description: "Model downgraded",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    variant: "warning" as const,
    description: "Approaching limit",
  },
  "auto-switch": {
    icon: RefreshCw,
    label: "Auto Switch",
    variant: "primary" as const,
    description: "Model switched",
  },
};

interface BudgetEnforcementCardsProps {
  data?: BudgetEnforcement[];
}

export function BudgetEnforcementCards({ data }: BudgetEnforcementCardsProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-44 mb-2" />
          <div className="skeleton h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Enforcement</CardTitle>
              <CardDescription>
                Actions taken across all customers
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data ?? BUDGET_ENFORCEMENTS).map((enforcement, i) => {
            const config = actionConfig[enforcement.action];
            const Icon = config.icon;
            const usagePercent = (enforcement.spent / enforcement.budget) * 100;

            return (
              <motion.div
                key={enforcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="relative p-4 rounded-xl bg-meridian-bg-hover/30 border border-meridian-border hover:border-meridian-border-light transition-all group/card"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      enforcement.severity === "critical"
                        ? "bg-chart-red/10"
                        : enforcement.severity === "warning"
                        ? "bg-chart-orange/10"
                        : "bg-chart-blue/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        enforcement.severity === "critical"
                          ? "text-chart-red"
                          : enforcement.severity === "warning"
                          ? "text-chart-orange"
                          : "text-chart-blue"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-meridian-text-primary">
                          {enforcement.customer}
                        </span>
                        <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-meridian-text-muted mb-2">
                      {config.description} — {enforcement.model}
                      {enforcement.fallback && (
                        <span className="text-chart-blue">
                          {" → "}{enforcement.fallback}
                        </span>
                      )}
                    </p>
                    {/* Budget bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-meridian-bg overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            usagePercent >= 100
                              ? "bg-chart-red"
                              : usagePercent >= 90
                              ? "bg-chart-orange"
                              : "bg-chart-blue"
                          )}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums font-medium",
                          usagePercent >= 100
                            ? "text-chart-red"
                            : usagePercent >= 90
                            ? "text-chart-orange"
                            : "text-meridian-text-secondary"
                        )}
                      >
                        {formatCurrency(enforcement.spent)} /{" "}
                        {formatCurrency(enforcement.budget)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
