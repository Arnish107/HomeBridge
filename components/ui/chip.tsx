"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Pill-shaped toggle used for filters. Pass a shared `group` so the active pill slides between options. */
export function Chip({
  active,
  onClick,
  children,
  group,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  group: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "text-cream" : "text-navy-600 hover:bg-navy-800/5 hover:text-navy-900"
      )}
    >
      {active && (
        <motion.span
          layoutId={`chip-${group}`}
          className="absolute inset-0 rounded-full bg-navy-800"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10">
        {children}
        {count !== undefined && <span className={cn("ml-1.5 tabular-nums", active ? "text-navy-300" : "text-navy-400")}>{count}</span>}
      </span>
    </button>
  );
}
