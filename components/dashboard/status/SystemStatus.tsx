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
import { SYSTEM_SERVICES, type SystemService } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Database,
  Server,
  Activity,
  Wifi,
  CreditCard,
  Globe,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Redis: Database,
  Postgres: Database,
  Queue: Server,
  Workers: Server,
  Stripe: CreditCard,
  API: Globe,
};

const statusColors = {
  operational: {
    dot: "bg-chart-green",
    pulse: "bg-chart-green/30",
    text: "text-chart-green",
    bg: "bg-chart-green/10",
  },
  degraded: {
    dot: "bg-chart-orange",
    pulse: "bg-chart-orange/30",
    text: "text-chart-orange",
    bg: "bg-chart-orange/10",
  },
  down: {
    dot: "bg-chart-red",
    pulse: "bg-chart-red/30",
    text: "text-chart-red",
    bg: "bg-chart-red/10",
  },
};

interface SystemStatusProps {
  data?: SystemService[];
}

export function SystemStatus({ data }: SystemStatusProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-32 mb-2" />
          <div className="skeleton h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            All systems operational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(data ?? SYSTEM_SERVICES).map((service, i) => {
              const Icon = iconMap[service.name] || Activity;
              const colors = statusColors[service.status];

              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-meridian-bg-hover/30 border border-meridian-border hover:border-meridian-border-light transition-all"
                >
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("w-4 h-4", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-meridian-text-primary">
                        {service.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)}>
                          <span className={cn("absolute w-1.5 h-1.5 rounded-full animate-ping", colors.pulse)} />
                        </span>
                        <span className={cn("text-[10px] font-medium capitalize", colors.text)}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-meridian-text-muted">
                        {service.latency}ms
                      </span>
                      <span className="text-[10px] text-meridian-text-muted">
                        {service.uptime}% uptime
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
