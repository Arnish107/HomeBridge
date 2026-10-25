import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.66rem] font-medium uppercase leading-none tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy-800/[0.06] text-navy-700",
        // Urgency is a word, not a sticker: no fill, amber ink.
        urgent: "px-0 font-semibold text-amber-700",
        solid: "bg-navy-800 text-cream",
        outline: "border border-border text-navy-600",
        success: "px-0 text-emerald-700",
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
