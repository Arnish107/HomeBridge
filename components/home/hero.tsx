"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { unsplash } from "@/components/home-photo";

interface HeroProps {
  photo?: { url: string; alt: string };
  openNeeds: number;
  urgentNeeds: number;
  homeCount: number;
  roleCount: number;
}

/** One headline line inside a clipping mask, so it can rise into view. */
function Line({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
      <span className={`hb-line block will-change-transform ${className}`}>{children}</span>
    </span>
  );
}

export function Hero({ photo, openNeeds, urgentNeeds, homeCount, roleCount }: HeroProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      root.current?.classList.add("is-ready");
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".hb-line", { yPercent: 105, duration: 1.3, stagger: 0.12 })
          // The window into the home opens from its centre once the words have settled.
          .from(".hb-window", { clipPath: "inset(0% 50% 0% 50% round 999px)", duration: 1.1, ease: "power3.inOut" }, 0.55)
          .from(".hb-window img", { scale: 1.35, duration: 1.6 }, 0.55)
          .from(".hb-after", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} data-reveal className="relative overflow-hidden pt-10 md:pt-14">
      <div className="container">
        <p className="hb-after eyebrow">Foster homes in North Metro Atlanta</p>

        <h1 className="display mt-8 text-[clamp(3.4rem,11vw,12.25rem)] md:mt-10">
          <Line>A little help.</Line>
          <Line className="pl-[6vw] md:pl-[9vw]">
            A place
            <span
              aria-hidden
              className="hb-window relative mx-[0.12em] inline-block h-[0.72em] w-[1.5em] translate-y-[0.04em] overflow-hidden rounded-full bg-cream-200 align-baseline"
            >
              {photo && (
                <Image
                  src={unsplash(photo.url, 900)}
                  alt=""
                  fill
                  unoptimized
                  priority
                  sizes="30vw"
                  className="object-cover"
                />
              )}
            </span>
            to
          </Line>
          <Line className="pl-[1vw] md:pl-[27vw]">call home.</Line>
        </h1>

        <div className="mt-14 grid border-t border-navy-900/15 md:mt-20 md:grid-cols-12">
          <p className="hb-after py-7 text-lg leading-relaxed text-navy-700 md:col-span-5 md:pr-10">
            HomeBridge shows you what foster homes near you are short on this week, from winter coats to a homework
            helper on Tuesdays, and lets you give it directly.
          </p>
          <div className="hb-after flex flex-wrap items-start gap-3 border-navy-900/15 py-7 md:col-span-4 md:border-l md:px-10">
            <Button asChild size="lg">
              <Link href="/homes">Find a home to help</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/volunteer">See volunteer roles</Link>
            </Button>
          </div>
          <dl className="hb-after grid grid-cols-3 gap-4 border-t border-navy-900/15 py-7 md:col-span-3 md:border-l md:border-t-0 md:pl-10">
            {[
              { k: "open needs", v: openNeeds },
              { k: "urgent", v: urgentNeeds },
              { k: roleCount === 1 ? "role" : "roles", v: roleCount },
            ].map((s) => (
              <div key={s.k}>
                <dd className="font-serif text-5xl leading-none text-navy-900">{s.v}</dd>
                <dt className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-navy-500">{s.k}</dt>
              </div>
            ))}
            <p className="col-span-3 text-xs text-navy-500">
              Live across {homeCount} verified homes.
            </p>
          </dl>
        </div>
      </div>
    </section>
  );
}
