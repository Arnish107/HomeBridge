import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="9" fill="#1B2A4A" />
      {/* bridge arch */}
      <path d="M6 22c3.2-6.2 16.8-6.2 20 0" fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 22h20" stroke="#F9F7F4" strokeWidth="2.2" strokeLinecap="round" />
      {/* roof */}
      <path d="M11.5 13.2 16 9l4.5 4.2" fill="none" stroke="#F9F7F4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="HomeBridge home">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className={cn("text-[1.05rem] font-bold tracking-tight", light ? "text-cream" : "text-navy-800")}>
        Home<span className="text-amber-500">Bridge</span>
      </span>
    </Link>
  );
}
