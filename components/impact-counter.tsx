"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import type { ImpactStats } from "@/lib/types";
import { Reveal } from "./motion";

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString()}
    </span>
  );
}

export function ImpactCounter({ stats }: { stats: ImpactStats }) {
  const items = [
    { value: stats.itemsDonated, label: "Items donated", sub: "Needs marked fulfilled by homes" },
    { value: stats.volunteersSignedUp, label: "Volunteers signed up", sub: "Neighbors showing up in person" },
    { value: stats.hoursVolunteered, label: "Hours pledged", sub: "Tutoring, meals, and mentoring" },
  ];

  return (
    <section aria-label="Community impact" className="container">
      <Reveal>
        <div className="grid border-y border-cream-300 sm:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.label}
              className={`py-8 sm:px-8 ${i > 0 ? "border-t border-cream-300 sm:border-l sm:border-t-0" : ""} ${i === 0 ? "sm:pl-0" : ""}`}
            >
              <p className="text-5xl font-bold tracking-tightest text-navy-800 lg:text-6xl">
                <CountUp to={it.value} />
              </p>
              <p className="mt-3 text-sm font-semibold text-navy-800">{it.label}</p>
              <p className="text-sm text-navy-500">{it.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
