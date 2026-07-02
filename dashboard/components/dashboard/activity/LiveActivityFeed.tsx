"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACTIVITY_FEED, type ActivityEntry } from "@/lib/constants";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeftRight,
  FileText,
  Shield,
  Key,
  ExternalLink,
  RefreshCw,
  Activity,
} from "lucide-react";

const activityIcons = {
  "budget-exceeded": AlertCircle,
  "model-switch": ArrowLeftRight,
  invoice: FileText,
  policy: Shield,
  "api-key": Key,
};

const activityColors = {
  "budget-exceeded": "text-chart-red bg-chart-red/10",
  "model-switch": "text-chart-orange bg-chart-orange/10",
  invoice: "text-chart-green bg-chart-green/10",
  policy: "text-chart-purple bg-chart-purple/10",
  "api-key": "text-chart-blue bg-chart-blue/10",
};

const severityColors = {
  critical: "danger",
  warning: "warning",
  info: "info",
  success: "success",
} as const;

interface LiveActivityFeedProps {
  data?: ActivityEntry[];
}

export function LiveActivityFeed({ data }: LiveActivityFeedProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isLive, setIsLive] = React.useState(true);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-36 mb-2" />
          <div className="skeleton h-4 w-44" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16" />
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
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Activity</CardTitle>
              <CardDescription>
                Real-time events across your infrastructure
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLive(!isLive)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all",
                  isLive
                    ? "bg-chart-green/10 text-chart-green"
                    : "bg-meridian-bg-hover text-meridian-text-muted"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isLive ? "bg-chart-green animate-pulse" : "bg-meridian-text-muted"
                )} />
                {isLive ? "LIVE" : "PAUSED"}
              </button>
              <Button variant="ghost" size="icon-sm">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <AnimatePresence initial={false}>
            {(data ?? ACTIVITY_FEED).map((activity, i) => {
              const Icon = activityIcons[activity.type] || Activity;
              const colorClasses = activityColors[activity.type] || "text-meridian-text-secondary bg-meridian-bg-hover";

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-meridian-bg-hover/50 transition-colors group/item"
                >
                  <div className={cn("p-1.5 rounded-lg shrink-0", colorClasses)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-meridian-text-primary">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-meridian-text-muted">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {activity.customer && (
                        <>
                          <span className="text-[11px] text-meridian-text-muted">·</span>
                          <span className="text-[11px] text-meridian-text-secondary">
                            {activity.customer}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={severityColors[activity.severity]}
                    className="text-[10px] px-1.5 py-0 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                  >
                    {activity.severity}
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-meridian-text-muted">
            <ExternalLink className="w-3 h-3 mr-1" />
            View all activity
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
