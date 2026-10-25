"use client";

import { useMemo, useState } from "react";
import { useStoredState } from "@/lib/use-stored-state";
import { EMPTY_LOG, HOURS_KEY } from "./hours-log";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { FosterHome, VolunteerOpportunity } from "@/lib/types";
import { SignupDialog } from "./forms/signup-dialog";
import { Chip } from "./ui/chip";
import { Button } from "./ui/button";

const OPP_CATEGORIES: { value: VolunteerOpportunity["category"]; label: string }[] = [
  { value: "tutoring", label: "Tutoring" },
  { value: "meals", label: "Meals" },
  { value: "mentoring", label: "Mentoring" },
  { value: "events", label: "Events" },
  { value: "other", label: "Other" },
];

/** Totals from the visitor's saved hours log (kept in this browser by the hours log page). */
function useLoggedHours() {
  const [log] = useStoredState(HOURS_KEY, EMPTY_LOG);
  return {
    total: log.entries.reduce((n, e) => n + (Number(e.hours) || 0), 0),
    sessions: log.entries.length,
  };
}

export function VolunteerBoard({ homes }: { homes: FosterHome[] }) {
  const [homeId, setHomeId] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const logged = useLoggedHours();

  const all = useMemo(
    () => homes.flatMap((home) => home.opportunities.map((opp) => ({ home, opp }))),
    [homes]
  );
  const results = all.filter(
    ({ home, opp }) => (homeId === "all" || home.id === homeId) && (category === "all" || opp.category === category)
  );
  const presentCategories = OPP_CATEGORIES.filter((c) => all.some((x) => x.opp.category === c.value));

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="space-y-4 border-b border-cream-300 pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-navy-400">Type</span>
            <div className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
              <Chip group="opp-cat" active={category === "all"} onClick={() => setCategory("all")}>
                All
              </Chip>
              {presentCategories.map((c) => (
                <Chip key={c.value} group="opp-cat" active={category === c.value} onClick={() => setCategory(c.value)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-navy-400">Home</span>
            <div className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
              <Chip group="opp-home" active={homeId === "all"} onClick={() => setHomeId("all")}>
                All homes
              </Chip>
              {homes
                .filter((h) => h.opportunities.length)
                .map((h) => (
                  <Chip key={h.id} group="opp-home" active={homeId === h.id} onClick={() => setHomeId(h.id)}>
                    {h.name}
                  </Chip>
                ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-navy-500" aria-live="polite">
          <strong className="font-semibold text-navy-800">{results.length}</strong>{" "}
          {results.length === 1 ? "opportunity" : "opportunities"}
        </p>

        <motion.ul layout className="mt-4 divide-y divide-cream-300 border-y border-cream-300">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map(({ home, opp }) => (
              <motion.li
                key={`${home.id}-${opp.id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-3 py-6 sm:grid-cols-[170px_1fr_auto] sm:items-center sm:gap-6"
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber-700">{opp.schedule}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-navy-400">
                    {OPP_CATEGORIES.find((c) => c.value === opp.category)?.label}
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-[1.9rem] font-normal leading-none">{opp.title}</h3>
                  <p className="mt-0.5 text-sm text-navy-500">{opp.description}</p>
                  <Link
                    href={`/homes/${home.id}`}
                    className="mt-1.5 inline-block text-sm font-medium text-navy-700 underline-offset-4 hover:underline"
                  >
                    {home.name}, {home.area}
                  </Link>
                </div>
                <SignupDialog
                  homeId={home.id}
                  homeName={home.name}
                  opportunity={opp}
                  triggerProps={{ size: "default", className: "justify-self-start" }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {results.length === 0 && (
          <p className="py-16 text-center text-navy-500">No opportunities match those filters right now.</p>
        )}
      </div>

      {/* Hours tracker */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl bg-navy-800 p-7 text-cream shadow-lift">
          <p className="eyebrow text-amber-400">Your service hours</p>
          <p className="mt-4 text-6xl font-bold tracking-tightest tabular-nums">
            {logged ? (logged.total % 1 ? logged.total.toFixed(2) : logged.total) : "–"}
          </p>
          <p className="mt-1 text-sm text-navy-300">
            hours logged across {logged?.sessions ?? 0} {logged?.sessions === 1 ? "session" : "sessions"}
          </p>
          <p className="mt-6 border-t border-white/10 pt-6 text-sm leading-relaxed text-navy-200">
            Need hours for school, a club, or a scholarship? Log each session and print a record your supervisor can
            sign.
          </p>
          <Button asChild variant="accent" className="mt-6 w-full">
            <Link href="/volunteer/hours">Open your hours log</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
