"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HEATMAP_DATA as HEATMAP_FALLBACK, DAY_LABELS, HOUR_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UsageHeatmapProps {
  data?: Array<{ day: number; hour: number; value: number }>;
}

export function UsageHeatmap({ data }: UsageHeatmapProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const heatmapData = data ?? HEATMAP_FALLBACK;

  // Group data by day
  const groupedData = DAY_LABELS.map((_, dayIndex) =>
    heatmapData.filter((d) => d.day === dayIndex)
  );

  const maxVal = Math.max(...heatmapData.map((d) => d.value));

  const getColor = (value: number) => {
    const intensity = value / maxVal;
    if (intensity < 0.2) return "bg-meridian-burgundy/10 dark:bg-meridian-bg-hover";
    if (intensity < 0.4) return "bg-meridian-burgundy/25 dark:bg-meridian-burgundy/20";
    if (intensity < 0.6) return "bg-meridian-burgundy/45 dark:bg-meridian-burgundy/35";
    if (intensity < 0.8) return "bg-meridian-burgundy/65 dark:bg-meridian-burgundy/50";
    return "bg-meridian-burgundy/85 dark:bg-meridian-burgundy/70";
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-40 mb-2" />
          <div className="skeleton h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-[280px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>API Usage Pattern</CardTitle>
          <CardDescription>Request volume heatmap (past 7 days)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="grid min-w-[840px] grid-cols-[3.5rem_repeat(24,minmax(0,1fr))] gap-1">
              <div />
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="h-8 text-[8px] text-meridian-text-muted text-center leading-8"
                >
                  {i}h
                </div>
              ))}

              {groupedData.map((row, dayIdx) => (
                <React.Fragment key={dayIdx}>
                  <div className="h-3 text-[10px] text-meridian-text-muted leading-3 text-right pr-1 self-center">
                    {DAY_LABELS[dayIdx]}
                  </div>
                  {row.map((cell, hourIdx) => (
                    <motion.div
                      key={`${dayIdx}-${hourIdx}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (dayIdx * 24 + hourIdx) * 0.002,
                        duration: 0.3,
                      }}
                      className={cn(
                        "aspect-square rounded-sm border border-black/5 dark:border-white/5 transition-all duration-200",
                        getColor(cell.value),
                        "hover:ring-1 hover:ring-meridian-burgundy-bright hover:scale-110 cursor-pointer"
                      )}
                      title={`${DAY_LABELS[dayIdx]} ${HOUR_LABELS[hourIdx]}: ${cell.value} requests`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] text-meridian-text-muted">Low</span>
            {[0.15, 0.3, 0.45, 0.6, 0.75].map((intensity) => (
              <div
                key={intensity}
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: `rgba(122, 31, 52, ${intensity})`,
                }}
              />
            ))}
            <span className="text-[10px] text-meridian-text-muted">High</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
