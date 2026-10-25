import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-navy-800 focus-visible:border-amber-500 focus-visible:ring-4 focus-visible:ring-amber-500/15 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  )
);
Select.displayName = "Select";
