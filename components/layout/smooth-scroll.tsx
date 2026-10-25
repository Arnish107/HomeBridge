"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Native browser scrolling, deliberately. We previously used Lenis smooth scrolling, but it
 * intercepts wheel events and must be driven every frame; when that wiring failed, the mouse
 * wheel stopped working entirely. Native scrolling is reliable with mouse, trackpad, touch,
 * keyboard and scrollbar, and GSAP ScrollTrigger reads it directly.
 *
 * This only tells ScrollTrigger to re-measure after a client-side navigation changes the layout.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return <>{children}</>;
}
