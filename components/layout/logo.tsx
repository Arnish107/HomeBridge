import Link from "next/link";
import { cn } from "@/lib/utils";

/** The mark: a single amber arch over an ink baseline, the "bridge" in HomeBridge. */
export function LogoMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 40 24" aria-hidden className={cn("h-5 w-auto", className)}>
      <path d="M4 20C8 8 32 8 36 20" fill="none" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
      <path d="M1.5 21.5h37" stroke={light ? "#F4EFE4" : "#131A2B"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-end gap-2", className)} aria-label="HomeBridge, home">
      <LogoMark light={light} className="mb-[0.3rem] transition-transform duration-500 group-hover:-translate-y-0.5" />
      <span className={cn("font-serif text-[1.65rem] leading-none tracking-[-0.01em]", light ? "text-cream" : "text-navy-900")}>
        HomeBridge
      </span>
    </Link>
  );
}
