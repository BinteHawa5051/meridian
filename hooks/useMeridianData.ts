"use client";

import { useQuery } from "@tanstack/react-query";
import { meridianApi, mockFallback } from "@/lib/api-client";
import { useDashboardStore } from "@/store/useDashboardStore";
import type {
  SummaryResponse, TimeSeriesResponse, BreakdownResponse,
  MarginResponse, BudgetsResponse, ActivityResponse, StatusResponse,
  RevenueResponse, StackedBarResponse, HeatmapResponse, CustomersResponse,
} from "@/lib/api-client";

// ─── Stale times ──────────────────────────────────────────────────────────────

const S = {
  summary:    30_000,
  timeseries: 60_000,
  breakdown:  60_000,
  margin:     60_000,
  budgets:    30_000,
  activity:   15_000,
  status:     30_000,
  revenue:    60_000,
  chart:      60_000,
};

const RETRY       = 2;                                               // reduced from 3
const RETRY_DELAY = (n: number) => Math.min(500 * 2 ** n, 5_000);  // faster: 500ms, 1s, 2s...

// ─── Single date-range read (avoid per-hook Zustand subscription) ─────────────
// All hooks call useCurrentRange() once and share the result.

function useCurrentRange() {
  return useDashboardStore((s) => s.dateRange);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSummary() {
  const r = useCurrentRange();
  return useQuery<SummaryResponse>({
    queryKey: ["meridian", "summary", r],
    queryFn:  () => meridianApi.getSummary(r),
    placeholderData: () => mockFallback.getSummary(),
    staleTime: S.summary, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useTimeSeries() {
  const r = useCurrentRange();
  return useQuery<TimeSeriesResponse>({
    queryKey: ["meridian", "timeseries", r],
    queryFn:  () => meridianApi.getTimeSeries(r),
    placeholderData: () => mockFallback.getTimeSeries(),
    staleTime: S.timeseries, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useBreakdown() {
  const r = useCurrentRange();
  return useQuery<BreakdownResponse>({
    queryKey: ["meridian", "breakdown", r],
    queryFn:  () => meridianApi.getBreakdown(r),
    placeholderData: () => mockFallback.getBreakdown(),
    staleTime: S.breakdown, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useMargin() {
  const r = useCurrentRange();
  return useQuery<MarginResponse>({
    queryKey: ["meridian", "margin", r],
    queryFn:  () => meridianApi.getMargin(r),
    placeholderData: () => mockFallback.getMargin(),
    staleTime: S.margin, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useBudgets() {
  const r = useCurrentRange();
  return useQuery<BudgetsResponse>({
    queryKey: ["meridian", "budgets", r],
    queryFn:  () => meridianApi.getBudgets(r),
    placeholderData: () => mockFallback.getBudgets(),
    staleTime: S.budgets, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useActivity() {
  return useQuery<ActivityResponse>({
    queryKey: ["meridian", "activity"],
    queryFn:  () => meridianApi.getActivity(),
    placeholderData: () => mockFallback.getActivity(),
    staleTime: S.activity, retry: RETRY, retryDelay: RETRY_DELAY,
    refetchInterval: S.activity,
  });
}

export function useSystemStatus() {
  return useQuery<StatusResponse>({
    queryKey: ["meridian", "status"],
    queryFn:  () => meridianApi.getStatus(),
    placeholderData: () => mockFallback.getStatus(),
    staleTime: S.status, retry: 1, retryDelay: 1000,
    refetchInterval: 30_000,
  });
}

export function useRevenue() {
  const r = useCurrentRange();
  return useQuery<RevenueResponse>({
    queryKey: ["meridian", "revenue", r],
    queryFn:  () => meridianApi.getRevenue(r),
    placeholderData: () => mockFallback.getRevenue(),
    staleTime: S.revenue, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useStackedBar() {
  const r = useCurrentRange();
  return useQuery<StackedBarResponse>({
    queryKey: ["meridian", "stacked-bar", r],
    queryFn:  () => meridianApi.getStackedBar(r),
    placeholderData: () => mockFallback.getStackedBar(),
    staleTime: S.chart, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useHeatmap() {
  const r = useCurrentRange();
  return useQuery<HeatmapResponse>({
    queryKey: ["meridian", "heatmap", r],
    queryFn:  () => meridianApi.getHeatmap(r),
    placeholderData: () => mockFallback.getHeatmap(),
    staleTime: S.chart, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}

export function useCustomers(search = "") {
  const r = useCurrentRange();
  return useQuery<CustomersResponse>({
    queryKey: ["meridian", "customers", r, search],
    queryFn:  () => meridianApi.getCustomers(r, search),
    staleTime: S.margin, retry: RETRY, retryDelay: RETRY_DELAY,
  });
}
