"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FosterHome, NeedCategory } from "@/lib/types";
import { NEED_CATEGORIES } from "@/lib/types";
import { HomeCard } from "./home-card";
import { Chip } from "./ui/chip";
import { Input } from "./ui/input";

type Filter = NeedCategory | "all";

const openIn = (h: FosterHome, c: Filter) => h.needs.some((n) => !n.fulfilled && (c === "all" || n.category === c));

export function HomesBrowser({ homes, initialCategory = "all" }: { homes: FosterHome[]; initialCategory?: Filter }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>(initialCategory);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return homes.filter((h) => {
      if (q && ![h.name, h.area, h.county].some((s) => s.toLowerCase().includes(q))) return false;
      if (category !== "all" && !openIn(h, category)) return false;
      if (urgentOnly && !h.needs.some((n) => n.urgent && !n.fulfilled)) return false;
      return true;
    });
  }, [homes, query, category, urgentOnly]);

  const counts = useMemo(
    () => Object.fromEntries(NEED_CATEGORIES.map((c) => [c.value, homes.filter((h) => openIn(h, c.value)).length])),
    [homes]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-cream-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="home-search" className="sr-only">
            Search homes by name or location
          </label>
          <Input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or county"
            className="h-12 rounded-full pl-5 pr-16"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy-400 hover:text-navy-800"
            >
              Clear
            </button>
          )}
        </div>

        <div className="-mx-5 flex items-center gap-1 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:px-0">
          <Chip group="cat" active={category === "all"} onClick={() => setCategory("all")} count={homes.length}>
            All needs
          </Chip>
          {NEED_CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              group="cat"
              active={category === c.value}
              onClick={() => setCategory(c.value)}
              count={counts[c.value]}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-navy-500" aria-live="polite">
          Showing <strong className="font-semibold text-navy-800">{results.length}</strong> of {homes.length} homes
        </p>
        <label className="inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-navy-700">
          Urgent needs only
          <button
            type="button"
            role="switch"
            aria-checked={urgentOnly}
            onClick={() => setUrgentOnly((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${urgentOnly ? "bg-amber-500" : "bg-cream-300"}`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${urgentOnly ? "right-0.5" : "left-0.5"}`}
            />
          </button>
        </label>
      </div>

      <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((home) => (
            <motion.div
              key={home.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <HomeCard home={home} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {results.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-xl font-semibold">No homes match those filters</p>
          <p className="mt-2 text-navy-500">Try a different search, or clear the filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("all");
              setUrgentOnly(false);
            }}
            className="mt-6 text-sm font-semibold text-navy-800 underline underline-offset-4"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
