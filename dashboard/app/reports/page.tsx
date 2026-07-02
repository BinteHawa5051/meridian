"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimeSeries, useBreakdown, useMargin, useRevenue } from "@/hooks/useMeridianData";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils";
import {
  FileText, Download, BarChart3, Users, DollarSign,
  TrendingUp, RefreshCw, Table2,
} from "lucide-react";

// ─── Report definition ────────────────────────────────────────────────────────

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  generate: () => string[][];  // returns rows for CSV
}

// ─── CSV helper ───────────────────────────────────────────────────────────────

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { dateRange } = useDashboardStore();
  const { data: tsData,  isLoading: tsLoading  } = useTimeSeries();
  const { data: bkData,  isLoading: bkLoading  } = useBreakdown();
  const { data: mgData,  isLoading: mgLoading  } = useMargin();
  const { data: revData, isLoading: revLoading } = useRevenue();

  const isLoading = tsLoading || bkLoading || mgLoading || revLoading;
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const reports: Report[] = [
    {
      id: "spend-over-time",
      title: "Spend Over Time",
      description: `Daily AI cost by provider for the last ${dateRange}`,
      icon: BarChart3,
      color: "blue",
      generate: () => {
        const header = ["Date", "OpenAI", "Anthropic", "Google", "Groq", "Mistral", "Other", "Total"];
        const rows = (tsData?.timeseries ?? []).map((d) => [
          d.date,
          d.openai.toFixed(4), d.anthropic.toFixed(4), d.google.toFixed(4),
          (d.groq ?? 0).toFixed(4), (d.mistral ?? 0).toFixed(4), d.other.toFixed(4), d.total.toFixed(4),
        ]);
        return [header, ...rows];
      },
    },
    {
      id: "model-usage",
      title: "Model Usage",
      description: "Cost, requests, tokens and latency per model",
      icon: Table2,
      color: "purple",
      generate: () => {
        const header = ["Model", "Provider", "Cost ($)", "Requests", "Tokens", "Latency (s)", "Share (%)"];
        const rows = (bkData?.byModel ?? []).map((m) => [
          m.name, m.provider, m.cost.toFixed(4),
          String(m.requests), String(m.tokens),
          m.latency.toFixed(3), m.percentage.toFixed(1),
        ]);
        return [header, ...rows];
      },
    },
    {
      id: "customer-margin",
      title: "Customer Profitability",
      description: "Revenue, AI cost, profit and margin per customer",
      icon: Users,
      color: "green",
      generate: () => {
        const header = ["Customer", "Revenue ($)", "AI Cost ($)", "Profit ($)", "Margin (%)"];
        const rows = (mgData?.customers ?? []).map((c) => [
          c.customer, c.revenue.toFixed(2), c.aiCost.toFixed(2),
          c.profit.toFixed(2), c.margin.toFixed(1),
        ]);
        return [header, ...rows];
      },
    },
    {
      id: "revenue-monthly",
      title: "Monthly Revenue",
      description: "12-month revenue, cost and margin trend",
      icon: TrendingUp,
      color: "orange",
      generate: () => {
        const header = ["Month", "Revenue ($)", "AI Cost ($)", "Profit ($)", "Margin (%)"];
        const rows = (revData?.revenue ?? []).map((r) => [
          r.month, r.revenue.toFixed(2), r.cost.toFixed(2),
          (r.revenue - r.cost).toFixed(2), r.margin.toFixed(1),
        ]);
        return [header, ...rows];
      },
    },
    {
      id: "provider-breakdown",
      title: "Provider Breakdown",
      description: "Cost share and totals by LLM provider",
      icon: DollarSign,
      color: "red",
      generate: () => {
        const header = ["Provider", "Cost ($)", "Share (%)"];
        const rows = (bkData?.byProvider ?? []).map((p) => [
          p.provider, p.cost.toFixed(2), p.percentage.toFixed(1),
        ]);
        return [header, ...rows];
      },
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue:   { bg: "bg-chart-blue/10",   icon: "text-chart-blue",   border: "border-chart-blue/20"   },
    purple: { bg: "bg-chart-purple/10", icon: "text-chart-purple", border: "border-chart-purple/20" },
    green:  { bg: "bg-chart-green/10",  icon: "text-chart-green",  border: "border-chart-green/20"  },
    orange: { bg: "bg-chart-orange/10", icon: "text-chart-orange", border: "border-chart-orange/20" },
    red:    { bg: "bg-chart-red/10",    icon: "text-chart-red",    border: "border-chart-red/20"    },
  };

  async function handleDownload(report: Report) {
    setDownloading(report.id);
    await new Promise((r) => setTimeout(r, 300)); // brief feedback delay
    const rows = report.generate();
    if (rows.length <= 1) {
      alert("No data available for this report in the selected date range.");
    } else {
      downloadCsv(`meridian-${report.id}-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    }
    setDownloading(null);
  }

  function handleDownloadAll() {
    reports.forEach((r) => {
      const rows = r.generate();
      if (rows.length > 1) {
        downloadCsv(`meridian-${r.id}-${dateRange}.csv`, rows);
      }
    });
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Reports</h1>
          <p className="text-sm text-meridian-text-muted">
            Export data for the selected date range · {dateRange}
          </p>
        </div>
        <Button
          variant="primary" size="sm"
          onClick={handleDownloadAll}
          disabled={isLoading}
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download All
        </Button>
      </motion.div>

      {/* Data status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6"
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-meridian-text-muted">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading data for reports…
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-chart-green">
            <span className="w-2 h-2 rounded-full bg-chart-green" />
            Data ready · {dateRange} range loaded
          </div>
        )}
      </motion.div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => {
          const c = colorMap[report.color];
          const Icon = report.icon;
          const rows = !isLoading ? report.generate() : [];
          const rowCount = rows.length > 1 ? rows.length - 1 : 0; // exclude header

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            >
              <Card className={cn("hover:shadow-card-hover transition-all duration-300 border", c.border)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", c.bg)}>
                      <Icon className={cn("w-5 h-5", c.icon)} />
                    </div>
                    <Badge variant="default" className="text-[10px] tabular-nums">
                      {isLoading ? "…" : `${rowCount} rows`}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-meridian-text-primary mb-1">
                    {report.title}
                  </h3>
                  <p className="text-xs text-meridian-text-muted mb-4 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Quick preview — first 3 data values */}
                  {!isLoading && rows.length > 1 && (
                    <div className="mb-4 space-y-1">
                      {rows.slice(1, 4).map((row, j) => (
                        <div key={j} className="flex items-center justify-between text-[11px]">
                          <span className="text-meridian-text-muted truncate max-w-[120px]">{row[0]}</span>
                          <span className="text-meridian-text-secondary tabular-nums font-medium">
                            {row[1].includes(".") ? `$${parseFloat(row[1]).toFixed(2)}` : row[1]}
                          </span>
                        </div>
                      ))}
                      {rowCount > 3 && (
                        <p className="text-[10px] text-meridian-text-muted">+{rowCount - 3} more rows</p>
                      )}
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownload(report)}
                    disabled={isLoading || downloading === report.id || rowCount === 0}
                  >
                    {downloading === report.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {rowCount === 0 && !isLoading ? "No data" : "Download CSV"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Shell>
  );
}
