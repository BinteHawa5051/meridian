"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn, formatCompactCurrency, formatCompactNumber, formatPercentage } from "@/lib/utils";
import { KPI_DATA } from "@/lib/constants";
import type { KpiData } from "@/lib/types";
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Users,
  MessageSquare,
  Gauge,
  TrendingDown,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  TrendingUp,
  PieChart,
  Users,
  MessageSquare,
  Gauge,
};

// Sparkline component using SVG path
function MiniSparkline({ data, color = "#8E243D" }: { data: { value: number }[]; color?: string }) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L${width},${height} L0,${height} Z`}
        fill={`url(#gradient-${color.replace("#", "")})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Animated counter
function AnimatedCounter({ value, format }: { value: number; format: KpiData["format"] }) {
  const [displayed, setDisplayed] = React.useState(0);

  React.useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatValue = () => {
    switch (format) {
      case "currency":
        return formatCompactCurrency(displayed);
      case "percentage":
        return `${displayed.toFixed(1)}%`;
      case "number":
        return formatCompactNumber(Math.round(displayed));
      default:
        return displayed.toLocaleString();
    }
  };

  return <span>{formatValue()}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

interface KpiCardsProps {
  data?: KpiData[];
}

export function KpiCards({ data }: KpiCardsProps) {
  const kpis = data ?? KPI_DATA;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = iconMap[kpi.icon] || DollarSign;
        const isPositive = kpi.value >= kpi.previousValue;
        const percentChange = ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100;

        return (
          <motion.div
            key={kpi.label}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group relative glass-panel-hover overflow-hidden cursor-default"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-meridian-burgundy/5 via-transparent to-transparent rounded-card" />
            </div>

            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-meridian-bg-hover group-hover:bg-meridian-burgundy/10 transition-colors duration-300">
                  <Icon className="w-4 h-4 text-meridian-text-secondary group-hover:text-meridian-burgundy-bright transition-colors" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive
                      ? "text-chart-green bg-chart-green/10"
                      : "text-chart-red bg-chart-red/10"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercentage(percentChange)}
                </div>
              </div>

              <div className="text-xl font-semibold text-meridian-text-primary tabular-nums mb-1">
                <AnimatedCounter value={kpi.value} format={kpi.format} />
              </div>

              <div className="text-xs text-meridian-text-muted mb-3">
                {kpi.label}
              </div>

              <div className="flex justify-end">
                <MiniSparkline data={kpi.sparklineData} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
