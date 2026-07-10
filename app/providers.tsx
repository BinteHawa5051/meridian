"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

// Single QueryClient instance across the whole app.
// gcTime: how long unused cache entries stay in memory (5 min).
// staleTime: default 30s — individual hooks override per endpoint.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:         30_000,   // 30s default
        gcTime:           300_000,   // 5 min — keep cache warm across navigation
        retry:                  2,
        retryDelay: (n) => Math.min(500 * 2 ** n, 5_000),
        refetchOnWindowFocus:  false, // don't slam the DB every time user alt-tabs
        refetchOnReconnect:    true,
      },
    },
  });
}

// Singleton outside of component so it survives hot-reloads in dev
let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient(); // SSR: always new
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
