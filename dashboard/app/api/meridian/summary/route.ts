export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache } from "@/lib/cache";
import { generateKpiData, generateDashboardStats } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const range    = new URL(req.url).searchParams.get("range") ?? "30d";
  const interval = ({ "7d":"7 days","30d":"30 days","90d":"90 days","12m":"365 days" } as Record<string,string>)[range] ?? "30 days";

  try {
    const result = await withCache(`summary:${range}`, 30_000, async () => {
      const [kpiRows, statsRows] = await Promise.all([
        db.query<{ total_cost:string; total_markup:string; total_requests:string; prev_cost:string; prev_requests:string }>(`
          WITH current AS (
            SELECT COALESCE(SUM(total_cost),0) AS total_cost, COALESCE(SUM(total_markup),0) AS total_markup,
                   COALESCE(SUM(request_count),0) AS total_requests
            FROM cost_by_hour WHERE bucket >= NOW() - INTERVAL '${interval}'
          ),
          previous AS (
            SELECT COALESCE(SUM(total_cost),0) AS prev_cost, COALESCE(SUM(request_count),0) AS prev_requests
            FROM cost_by_hour
            WHERE bucket >= NOW() - INTERVAL '${interval}' * 2 AND bucket < NOW() - INTERVAL '${interval}'
          )
          SELECT c.*, p.prev_cost, p.prev_requests FROM current c, previous p
        `),
        db.query<{ active_customers:string; total_markup:string }>(`
          SELECT COUNT(*) FILTER (WHERE active=TRUE) AS active_customers,
                 COALESCE((SELECT SUM(total_markup) FROM cost_by_hour WHERE bucket >= NOW() - INTERVAL '${interval}'),0) AS total_markup
          FROM customers
        `),
      ]);

      const row  = kpiRows.rows[0];
      const stat = statsRows.rows[0];
      const totalCost    = parseFloat(row?.total_cost    ?? "0");
      const prevCost     = parseFloat(row?.prev_cost     ?? "0");
      const totalRevenue = totalCost + parseFloat(row?.total_markup ?? "0");
      const totalReqs    = parseInt  (row?.total_requests ?? "0");
      const activeCusts  = parseInt  (stat?.active_customers ?? "0");
      const margin       = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

      const kpis = [
        { label:"Total AI Spend",   value:totalCost,   previousValue:prevCost||totalCost*0.89,     format:"currency",   icon:"DollarSign",    sparklineData:Array.from({length:30},(_,i)=>({value:totalCost/30*(0.8+Math.sin(i*0.4)*0.2)}))},
        { label:"Revenue",          value:totalRevenue,previousValue:totalRevenue*0.87,             format:"currency",   icon:"TrendingUp",    sparklineData:Array.from({length:30},(_,i)=>({value:totalRevenue/30*(0.85+Math.sin(i*0.5)*0.15)}))},
        { label:"Profit Margin",    value:parseFloat(margin.toFixed(1)),previousValue:parseFloat((margin*0.9).toFixed(1)), format:"percentage",icon:"PieChart",sparklineData:Array.from({length:30},(_,i)=>({value:margin*(0.9+Math.sin(i*0.3)*0.1)}))},
        { label:"Active Customers", value:activeCusts, previousValue:Math.round(activeCusts*0.88), format:"number",     icon:"Users",         sparklineData:Array.from({length:30},(_,i)=>({value:Math.round(activeCusts*(0.85+(i/30)*0.15))}))},
        { label:"LLM Requests",     value:totalReqs,   previousValue:Math.round(totalReqs*0.82),   format:"number",     icon:"MessageSquare", sparklineData:Array.from({length:30},(_,i)=>({value:Math.round(totalReqs/30*(0.8+Math.sin(i*0.6)*0.2))}))},
        { label:"Budget Usage",     value:72.4,        previousValue:65.8,                         format:"percentage", icon:"Gauge",         sparklineData:Array.from({length:30},(_,i)=>({value:55+(i/30)*17}))},
      ];

      const stats = { totalCustomers:activeCusts, activeCustomers:activeCusts, churnedCustomers:0,
        totalRevenue, totalAiCost:totalCost, averageMargin:parseFloat(margin.toFixed(1)),
        monthlyRequestVolume:totalReqs, activeModels:14, providersIntegrated:4, budgetUtilization:72.4, alertsActive:4, policiesActive:12 };

      return { kpis, stats };
    });

    return NextResponse.json({ ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/meridian/summary] error:", err);
    return NextResponse.json({ kpis: generateKpiData(), stats: generateDashboardStats(), generatedAt: new Date().toISOString(), _source: "mock" });
  }
}
