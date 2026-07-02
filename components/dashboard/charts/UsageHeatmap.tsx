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
    if (intensity < 0.2) return "bg-meridian-bg-hover";
    if (intensity < 0.4) return "bg-meridian-burgundy/20";
    if (intensity < 0.6) return "bg-meridian-burgundy/35";
    if (intensity < 0.8) return "bg-meridian-burgundy/50";
    return "bg-meridian-burgundy/70";
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
        <CardContent>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-[600px]">
              {/* Hour labels */}
              <div className="flex flex-col gap-1 pr-2">
                <div className="h-8" /> {/* Spacer for header */}
                {DAY_LABELS.map((day) => (
                  <div
                    key={day}
                    className="h-3 text-[10px] text-meridian-text-muted leading-3 text-right"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex-1">
                {/* Hour header */}
                <div className="flex gap-1 mb-1 overflow-hidden">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 text-[8px] text-meridian-text-muted text-center leading-8 h-8"
                    >
                      {i}h
                    </div>
                  ))}
                </div>

                {/* Heatmap rows */}
                {groupedData.map((row, dayIdx) => (
                  <div key={dayIdx} className="flex gap-1 mb-1">
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
                          "flex-1 aspect-square rounded-sm transition-all duration-200",
                          getColor(cell.value),
                          "hover:ring-1 hover:ring-meridian-burgundy-bright hover:scale-110 cursor-pointer"
                        )}
                        title={`${DAY_LABELS[dayIdx]} ${HOUR_LABELS[hourIdx]}: ${cell.value} requests`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
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
