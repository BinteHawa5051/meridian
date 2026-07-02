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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CUSTOMER_PROFITABILITY, type CustomerProfitability } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomerProfitabilityTableProps {
  data?: CustomerProfitability[];
}

export function CustomerProfitabilityTable({ data }: CustomerProfitabilityTableProps) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  React.useEffect(() => setMounted(true), []);

  const items = data ?? CUSTOMER_PROFITABILITY;
  const filtered = items.filter((c) =>
    c.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="group hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Profitability</CardTitle>
              <CardDescription>
                Revenue, AI costs, and margin by customer
              </CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-meridian-text-muted" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>AI Cost</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer, i) => (
                <motion.tr
                  key={customer.customer}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group/row border-b border-meridian-border hover:bg-meridian-bg-hover/50 transition-colors cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-meridian-bg-hover flex items-center justify-center text-xs font-medium text-meridian-text-secondary group-hover/row:bg-meridian-burgundy/10 group-hover/row:text-meridian-burgundy-bright transition-all">
                        {customer.customer.charAt(0)}
                      </div>
                      <span className="font-medium">{customer.customer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(customer.revenue)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(customer.aiCost)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "tabular-nums font-medium",
                      customer.profit >= 0
                        ? "text-chart-green"
                        : "text-chart-red"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {customer.profit >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {formatCurrency(customer.profit)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-meridian-bg-hover overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            customer.margin >= 20
                              ? "bg-chart-green"
                              : customer.margin >= 0
                              ? "bg-chart-orange"
                              : "bg-chart-red"
                          )}
                          style={{
                            width: `${Math.min(
                              Math.abs(customer.margin) * 2,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs tabular-nums font-medium",
                          customer.margin >= 20
                            ? "text-chart-green"
                            : customer.margin >= 0
                            ? "text-chart-orange"
                            : "text-chart-red"
                        )}
                      >
                        {customer.margin.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        customer.margin >= 20
                          ? "success"
                          : customer.margin >= 0
                          ? "warning"
                          : "danger"
                      }
                    >
                      {customer.margin >= 20
                        ? "Healthy"
                        : customer.margin >= 0
                        ? "At Risk"
                        : "Loss"}
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
