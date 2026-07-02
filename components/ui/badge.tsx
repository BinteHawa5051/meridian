import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-meridian-bg-hover text-meridian-text-secondary border border-meridian-border",
        primary:
          "bg-meridian-burgundy/10 text-meridian-burgundy-bright border border-meridian-burgundy/20",
        success:
          "bg-chart-green/10 text-chart-green border border-chart-green/20",
        warning:
          "bg-chart-orange/10 text-chart-orange border border-chart-orange/20",
        danger:
          "bg-chart-red/10 text-chart-red border border-chart-red/20",
        info: "bg-chart-blue/10 text-chart-blue border border-chart-blue/20",
        purple:
          "bg-chart-purple/10 text-chart-purple border border-chart-purple/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
