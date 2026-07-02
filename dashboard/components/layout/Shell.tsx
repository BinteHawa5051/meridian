"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { sidebarCollapsed } = useDashboardStore();

  return (
    <div className="min-h-screen bg-meridian-bg mesh-bg">
      {/* Subtle floating particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-meridian-burgundy/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-meridian-burgundy/3 rounded-full blur-[80px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-meridian-burgundy/2 rounded-full blur-[60px] animate-float" style={{ animationDelay: "-5s" }} />
      </div>

      <Sidebar />

      <TopNav />

      <main
        className={cn(
          "relative z-10 pt-16 transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
