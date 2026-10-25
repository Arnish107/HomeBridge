import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-navy-800 shadow-[inset_0_1px_2px_rgba(27,42,74,0.04)] transition-colors placeholder:text-navy-400/80 focus-visible:border-amber-500 focus-visible:ring-4 focus-visible:ring-amber-500/15 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
