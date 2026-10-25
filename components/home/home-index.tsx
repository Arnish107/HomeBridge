"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FosterHome } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { openNeeds, urgentNeeds } from "@/lib/needs";
import { timeAgo } from "@/lib/time";
import { unsplash, HomePhoto } from "@/components/home-photo";
import { cn } from "@/lib/utils";

function Details({ home }: { home: FosterHome }) {
  const open = openNeeds(home);
  const updated = timeAgo(home.updatedAt);
  return (
    <div>
      <p className="text-[0.95rem] leading-relaxed text-navy-700">
        {home.description.length > 190 ? home.description.slice(0, 188).trimEnd() + "…" : home.description}
      </p>
      <ul className="mt-5 border-t border-navy-900/15">
        {open.slice(0, 3).map((n) => (
          <li key={n.id} className="flex items-baseline justify-between gap-4 border-b border-navy-900/15 py-2.5">
            <span className="text-navy-900">{n.title}</span>
            <span className={cn("shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em]", n.urgent ? "font-semibold text-amber-700" : "text-navy-500")}>
              {n.urgent ? "Urgent" : categoryLabel(n.category)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-4">
        <Link
          href={`/homes/${home.id}`}
          className="font-medium text-navy-900 underline decoration-amber-500 decoration-2 underline-offset-[6px] hover:text-amber-700"
        >
          Visit {home.name}
        </Link>
        {updated && <span className="text-xs text-navy-500">Updated {updated}</span>}
      </div>
    </div>
  );
}

export function HomeIndex({ homes }: { homes: FosterHome[] }) {
  const [activeId, setActiveId] = useState(homes[0]?.id);
  const active = homes.find((h) => h.id === activeId) ?? homes[0];
  if (!active) return null;

  return (
    <section aria-labelledby="homes-title" className="container pt-32 md:pt-44">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="homes-title" className="display text-[clamp(2.8rem,6.4vw,6.5rem)] md:col-span-7">
          The homes, by name.
        </h2>
        <p className="max-w-sm text-navy-600 md:col-span-5 md:justify-self-end">
          Every home is reviewed before it appears. We show the town, never the address.
        </p>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-12">
        {/* The index */}
        <ol className="border-t border-navy-900/80 md:col-span-7">
          {homes.map((h, i) => {
            const isActive = h.id === active.id;
            const urgent = urgentNeeds(h).length;
            return (
              <li key={h.id} className="border-b border-navy-900/15">
                <button
                  type="button"
                  onMouseEnter={() => setActiveId(h.id)}
                  onFocus={() => setActiveId(h.id)}
                  onClick={() => setActiveId(h.id)}
                  aria-expanded={isActive}
                  aria-controls={`home-panel-${h.id}`}
                  className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-5 text-left md:py-6"
                >
                  <span className="font-mono text-xs text-navy-500">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={cn(
                      "font-serif text-[clamp(2.1rem,4.4vw,4.25rem)] leading-[0.95] transition-colors duration-300",
                      isActive ? "text-navy-900" : "text-[#838999] group-hover:text-navy-600"
                    )}
                  >
                    {h.name}
                  </span>
                  <span className="text-right font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.1em] text-navy-500">
                    {h.area.replace(/, GA$/, "")}
                    <br />
                    {urgent > 0 ? <span className="font-semibold text-amber-700">{urgent} urgent</span> : `${openNeeds(h).length} needs`}
                  </span>
                </button>

                {/* Touch: details open in place under the name */}
                <div
                  id={`home-panel-${h.id}`}
                  hidden={!isActive}
                  className="pb-8 md:hidden"
                >
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-lg">
                    <HomePhoto home={h} width={800} />
                  </div>
                  <Details home={h} />
                </div>
              </li>
            );
          })}
        </ol>

        {/* Desktop: a sticky preview that follows the index */}
        <aside className="hidden md:col-span-5 md:block" aria-live="polite">
          <div className="sticky top-24">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-200">
              {homes.map((h) =>
                h.photo ? (
                  <Image
                    key={h.id}
                    src={unsplash(h.photo.url, 900)}
                    alt={h.photo.alt}
                    fill
                    unoptimized
                    sizes="40vw"
                    className={cn(
                      "object-cover transition-[opacity,transform] duration-700 ease-out",
                      h.id === active.id ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                    )}
                  />
                ) : null
              )}
              {!active.photo && <HomePhoto home={active} />}
            </div>
            <div className="mt-6">
              <h3 className="sr-only">{active.name}</h3>
              <Details home={active} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
