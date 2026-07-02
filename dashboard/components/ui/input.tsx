import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-meridian-border bg-meridian-bg px-3 py-2 text-sm text-meridian-text-primary placeholder:text-meridian-text-muted transition-all duration-200",
          "focus:outline-none focus:border-meridian-burgundy/50 focus:ring-1 focus:ring-meridian-burgundy/20 focus:shadow-glow",
          "hover:border-meridian-border-light",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
