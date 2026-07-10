"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page:       number;
  totalPages: number;
  total:      number;
  limit:      number;
  onChange:   (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)  pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase = "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#27272a]">
      <p className="text-xs text-[#71717A]">
        Showing <span className="text-[#A1A1AA] font-medium">{from}–{to}</span> of{" "}
        <span className="text-[#A1A1AA] font-medium">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={cn(btnBase, "text-[#71717A] hover:bg-[#1a1a1d] disabled:opacity-30 disabled:cursor-not-allowed")}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#52525b]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                btnBase,
                p === page
                  ? "bg-[#7A1F34]/20 text-[#A52D4F] border border-[#7A1F34]/30"
                  : "text-[#71717A] hover:bg-[#1a1a1d] hover:text-[#A1A1AA]"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={cn(btnBase, "text-[#71717A] hover:bg-[#1a1a1d] disabled:opacity-30 disabled:cursor-not-allowed")}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
