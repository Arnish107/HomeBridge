"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * The story's last beat: a navy field that widens to the full screen as it scrolls in,
 * carrying the largest sentence on the page. Only the background is clipped, never the words.
 */
export function Closing() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".closing-bg",
          // Starts narrower than the container's side padding, so the text is never clipped.
          { clipPath: "inset(0% 2.5% 0% 2.5% round 18px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 25%", scrub: 0.5 },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="closing-title" className="pt-32 md:pt-44">
      <div className="relative text-cream">
        <div aria-hidden className="closing-bg absolute inset-0 bg-navy-800" />
        <div className="container relative py-24 md:py-36">
          <h2
            id="closing-title"
            className="max-w-[16ch] font-serif text-[clamp(3.2rem,9vw,9.5rem)] font-normal leading-[0.9] tracking-[-0.025em] text-cream"
          >
            Somewhere close by, a kid is waiting on a winter coat.
          </h2>
          <div className="mt-14 grid gap-8 border-t border-cream/20 pt-8 md:grid-cols-12">
            <p className="text-lg leading-relaxed text-navy-200 md:col-span-5">
              Pick one home and one thing. That&apos;s the whole ask.
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-7 md:justify-end">
              <Link
                href="/homes"
                className="rounded-full bg-amber-500 px-7 py-3.5 font-medium text-navy-900 transition-colors hover:bg-amber-400"
              >
                Find a home to help
              </Link>
              <Link
                href="/near-me"
                className="rounded-full border border-cream/30 px-7 py-3.5 font-medium text-cream transition-colors hover:border-cream/70"
              >
                Homes near me
              </Link>
            </div>
          </div>
          <p className="mt-10 text-sm text-navy-300">
            Run a licensed foster home?{" "}
            <Link href="/register" className="text-cream underline decoration-cream/30 underline-offset-4 hover:decoration-amber-500">
              List your needs on HomeBridge
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
