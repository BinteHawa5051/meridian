import { create } from "zustand";

interface DashboardState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  dateRange: "7d" | "30d" | "90d" | "12m";
  setDateRange: (range: "7d" | "30d" | "90d" | "12m") => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),
  dateRange: "30d",
  setDateRange: (range) => set({ dateRange: range }),
}));
