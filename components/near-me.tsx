"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { FosterHome } from "@/lib/types";
import { openNeeds, urgentNeeds } from "@/lib/needs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const HomesMap = dynamic(() => import("./homes-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-cream-200" />,
});

type Origin = { lat: number; lng: number };

/** Distance in miles between two coordinates. */
function miles(a: Origin, b: Origin) {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function NearMe({ homes }: { homes: FosterHome[] }) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { results, matched } = useMemo(() => {
    if (origin) {
      const sorted = [...homes]
        .map((h) => ({ home: h, dist: miles(origin, h) }))
        .sort((a, b) => a.dist - b.dist);
      return { results: sorted, matched: true };
    }
    const q = query.trim().toLowerCase();
    if (!q) return { results: homes.map((home) => ({ home, dist: null })), matched: true };
    const hits = homes.filter(
      (h) =>
        h.zips.some((z) => z.startsWith(q)) ||
        h.area.toLowerCase().includes(q) ||
        h.county.toLowerCase().includes(q)
    );
    return {
      results: (hits.length ? hits : homes).map((home) => ({ home, dist: null as number | null })),
      matched: hits.length > 0,
    };
  }, [homes, query, origin]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setOrigin(null);
    setGeoError(null);
    setQuery(input);
    setActiveId(null);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location. Try a ZIP code instead.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setInput("");
        setQuery("");
        setLocating(false);
      },
      () => {
        setGeoError("We couldn't get your location. Try a ZIP code or city instead.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
      <div className="order-2 min-w-0 lg:order-1">
        <form onSubmit={search} className="flex gap-2">
          <label htmlFor="near-q" className="sr-only">
            ZIP code or city
          </label>
          <Input
            id="near-q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ZIP code or city, e.g. 30041 or Roswell"
            className="h-12 rounded-full pl-5"
            inputMode="search"
          />
          <Button type="submit" size="lg" className="shrink-0">
            Search
          </Button>
        </form>
        <button
          onClick={locateMe}
          disabled={locating}
          className="mt-3 text-sm font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 disabled:opacity-50"
        >
          {locating ? "Finding you…" : "Use my current location"}
        </button>
        <p className="mt-1 text-xs text-navy-400">Your location stays in your browser and is never saved.</p>

        <div className="mt-8 border-b border-cream-300 pb-3 text-sm text-navy-500" aria-live="polite">
          {geoError ? (
            <span className="text-destructive">{geoError}</span>
          ) : origin ? (
            "Homes sorted by distance from you"
          ) : query && !matched ? (
            <>
              No homes in &ldquo;{query}&rdquo; yet. Showing every home instead.
            </>
          ) : query ? (
            <>
              <strong className="text-navy-800">{results.length}</strong> {results.length === 1 ? "home" : "homes"} near
              &ldquo;{query}&rdquo;
            </>
          ) : (
            <>
              <strong className="text-navy-800">{homes.length}</strong> homes in North Metro Atlanta
            </>
          )}
        </div>

        <ul className="divide-y divide-cream-300">
          <AnimatePresence initial={false}>
            {results.map(({ home, dist }) => {
              const open = openNeeds(home).length;
              const urgent = urgentNeeds(home).length;
              return (
                <motion.li
                  key={home.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onMouseEnter={() => setActiveId(home.id)}
                  className={cn(
                    "-mx-4 rounded-xl px-4 py-5 transition-colors",
                    activeId === home.id && "bg-card shadow-soft"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <Link href={`/homes/${home.id}`} className="font-serif text-[2rem] font-normal leading-none hover:underline">
                      {home.name}
                    </Link>
                    {dist !== null && (
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-amber-700">
                        ~{dist < 1 ? "<1" : Math.round(dist)} mi
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-navy-500">{home.area}</p>
                  <p className="mt-2 text-sm text-navy-600">
                    {open} open needs
                    {urgent > 0 && <span className="font-semibold text-amber-700"> · {urgent} urgent</span>} ·{" "}
                    {home.opportunities.length} volunteer {home.opportunities.length === 1 ? "role" : "roles"}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <div className="order-1 lg:order-2">
        <div
          className="relative z-0 h-72 overflow-hidden rounded-xl border border-cream-200 shadow-soft sm:h-96 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]"
        >
          <HomesMap homes={results.map((r) => r.home)} activeId={activeId} onSelect={setActiveId} />
        </div>
        <p className="mt-2 text-xs text-navy-400">Pins mark the general city or county, never a home&apos;s real location.</p>
      </div>
    </div>
  );
}
