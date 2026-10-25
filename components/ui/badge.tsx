import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy-800/[0.06] text-navy-700",
        urgent: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300/70",
        solid: "bg-navy-800 text-cream",
        outline: "border border-border text-navy-600",
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
