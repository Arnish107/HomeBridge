"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

const STEPS = [
  {
    title: "Discover a need.",
    body: "Browse verified foster homes near you and see exactly what each one is short on this week: coats in the right sizes, a homework helper, diapers for a new arrival.",
  },
  {
    title: "Choose how to help.",
    body: "Send something straight from the home's wish list, or sign up to give an afternoon. You don't need an account for either.",
  },
  {
    title: "Make a difference.",
    body: "Gifts ship directly to the home, and homes mark items fulfilled, so the list you see is always what's still needed.",
  },
];

/** A numbered narrative. A thin amber line tracks your progress through the three steps. */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".hiw-progress",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".hiw-steps", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
          }
        );
        gsap.utils.toArray<HTMLElement>(".hiw-step").forEach((step) => {
          gsap.fromTo(
            step.querySelector(".hiw-num"),
            { color: "#838999" }, // dim but still 3:1 on paper (WCAG large text)
            {
              color: "#131A2B",
              ease: "none",
              scrollTrigger: { trigger: step, start: "top 72%", end: "top 45%", scrub: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="hiw-title" className="container pt-32 md:pt-44">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <h2 id="hiw-title" className="display text-[clamp(2.8rem,5vw,5rem)]">
              Helping takes about five minutes.
            </h2>
          </div>
        </div>

        <ol className="hiw-steps relative md:col-span-8 md:pl-12">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 hidden w-px bg-navy-900/15 md:block" />
          <span aria-hidden className="hiw-progress absolute bottom-0 left-0 top-0 hidden w-px origin-top bg-amber-500 md:block" />
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="hiw-step grid gap-4 border-t border-navy-900/15 py-10 first:border-t-0 first:pt-0 sm:grid-cols-[auto_1fr] sm:gap-10 md:py-14"
            >
              <span className="hiw-num font-serif text-[clamp(5rem,9vw,8.5rem)] leading-[0.75] tracking-[-0.04em] text-navy-900">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-lg">
                <h3 className="font-serif text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1] text-navy-900">{s.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-navy-700">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
