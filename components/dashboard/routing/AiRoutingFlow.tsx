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
import { cn } from "@/lib/utils";
import {
  Brain,
  Shield,
  ArrowDown,
  X,
  Check,
  Ban,
  ChevronRight,
} from "lucide-react";

interface RoutingNode {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "active" | "success" | "rejected" | "pending";
  description: string;
}

const routingFlow: RoutingNode[] = [
  {
    id: "gpt4",
    label: "GPT-4o",
    icon: Brain,
    status: "active",
    description: "Original request",
  },
  {
    id: "budget",
    label: "Budget Check",
    icon: Shield,
    status: "success",
    description: "$42.5K / $50K used",
  },
  {
    id: "claude",
    label: "Claude Sonnet",
    icon: Brain,
    status: "pending",
    description: "Fallback route",
  },
  {
    id: "mini",
    label: "GPT-4o Mini",
    icon: Brain,
    status: "pending",
    description: "Secondary fallback",
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: Ban,
    status: "pending",
    description: "Budget exceeded",
  },
];

const statusConfig = {
  active: { border: "border-chart-blue", glow: "bg-chart-blue/10", icon: ChevronRight, color: "text-chart-blue", borderColor: "#3B82F6" },
  success: { border: "border-chart-green", glow: "bg-chart-green/10", icon: Check, color: "text-chart-green", borderColor: "#10B981" },
  rejected: { border: "border-chart-red", glow: "bg-chart-red/10", icon: X, color: "text-chart-red", borderColor: "#EF4444" },
  pending: { border: "border-meridian-border", glow: "bg-meridian-bg-hover", icon: ArrowDown, color: "text-meridian-text-muted", borderColor: "#27272A" },
};

export function AiRoutingFlow() {
  const [mounted, setMounted] = React.useState(false);
  const [activeRoute, setActiveRoute] = React.useState(0);
  React.useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveRoute((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-32 mb-2" />
          <div className="skeleton h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>AI Routing Flow</CardTitle>
          <CardDescription>
            Request routing visualization — budget check → fallback → result
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {routingFlow.map((node, i) => {
              const config = statusConfig[node.status];
              const Icon = node.icon;
              const StatusIcon = config.icon;
              const isActive = i === activeRoute;
              const isPast = i < activeRoute;

              return (
                <React.Fragment key={node.id}>
                  {/* Node */}
                  <div className="flex flex-col items-center min-w-[100px]">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        borderColor: isActive
                          ? config.borderColor
                          : undefined,
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 cursor-pointer w-full",
                        config.border,
                        config.glow,
                        isActive && "shadow-glow"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "p-2 rounded-lg mb-2 transition-colors",
                          config.color.replace("text-", "bg-") + "/10"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", config.color)} />
                      </div>
                      {/* Label */}
                      <span
                        className={cn(
                          "text-xs font-medium text-center",
                          config.color
                        )}
                      >
                        {node.label}
                      </span>
                      {/* Description */}
                      <span
                        className={cn(
                          "text-[10px] text-center mt-0.5",
                          config.color.replace("text-", "text-").replace(/(bg-|border-|ring-)/g, ""),
                          "opacity-60"
                        )}
                      >
                        {node.description}
                      </span>
                      {/* Status indicator */}
                      <motion.div
                        animate={{ rotate: isActive ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center",
                          config.glow,
                          config.border.replace("border", "border")
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Arrow between nodes */}
                  {i < routingFlow.length - 1 && (
                    <div className="flex items-center pt-8 px-1">
                      <motion.div
                        animate={{
                          x: isPast ? 3 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronRight
                          className={cn(
                            "w-5 h-5",
                            isPast
                              ? "text-chart-green"
                              : "text-meridian-text-muted"
                          )}
                        />
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active route indicator */}
          <div className="mt-4 pt-3 border-t border-meridian-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-meridian-text-muted">
                Current route
              </span>
              <Badge variant="info" className="text-[10px]">
                {routingFlow[Math.min(activeRoute, routingFlow.length - 1)].label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
