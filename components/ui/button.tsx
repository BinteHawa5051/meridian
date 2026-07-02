import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meridian-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-meridian-bg disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-meridian-burgundy text-white hover:bg-meridian-burgundy-light active:bg-meridian-burgundy-bright shadow-lg shadow-meridian-burgundy/20 hover:shadow-meridian-burgundy/30 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-meridian-bg-hover text-meridian-text-primary hover:bg-meridian-bg-card border border-meridian-border hover:border-meridian-border-light active:scale-[0.98]",
        ghost:
          "text-meridian-text-secondary hover:text-meridian-text-primary hover:bg-meridian-bg-hover active:scale-[0.98]",
        outline:
          "border border-meridian-border text-meridian-text-primary hover:bg-meridian-bg-hover hover:border-meridian-border-light active:scale-[0.98]",
        danger:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
