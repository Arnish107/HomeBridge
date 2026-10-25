"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogoMark } from "./layout/logo";

interface Entry {
  id: string;
  date: string;
  home: string;
  activity: string;
  hours: number;
}

interface LogState {
  volunteer: string;
  school: string;
  entries: Entry[];
}

const KEY = "homebridge.hours.v1";
const EMPTY: LogState = { volunteer: "", school: "", entries: [] };

function load(): LogState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Local (not UTC) date as YYYY-MM-DD, for date inputs. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function HoursLog({ homes }: { homes: string[] }) {
  const [state, setState] = useState<LogState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode); the log still works for this visit
    }
  }, [state, ready]);

  const total = useMemo(() => state.entries.reduce((n, e) => n + e.hours, 0), [state.entries]);
  const sorted = useMemo(() => [...state.entries].sort((a, b) => a.date.localeCompare(b.date)), [state.entries]);

  function addEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const entry: Entry = {
      id: crypto.randomUUID(),
      date: String(f.get("date")),
      home: String(f.get("home")),
      activity: String(f.get("activity")).trim(),
      hours: Math.round(Number(f.get("hours")) * 4) / 4,
    };
    if (!entry.date || !entry.activity || !(entry.hours > 0)) return;
    setState((s) => ({ ...s, entries: [...s.entries, entry] }));
    form.reset();
    (form.elements.namedItem("date") as HTMLInputElement).value = today();
  }

  const remove = (id: string) => setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:gap-12">
      {/* Entry form */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start print:hidden">
        <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-soft">
          <h2 className="font-semibold">Your details</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="h-name">Volunteer name</Label>
              <Input
                id="h-name"
                value={state.volunteer}
                onChange={(e) => setState((s) => ({ ...s, volunteer: e.target.value }))}
                placeholder="Jordan Lee"
                maxLength={80}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="h-school">School or organization (optional)</Label>
              <Input
                id="h-school"
                value={state.school}
                onChange={(e) => setState((s) => ({ ...s, school: e.target.value }))}
                placeholder="South Forsyth High School"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <form onSubmit={addEntry} className="rounded-3xl border border-cream-200 bg-white p-6 shadow-soft">
          <h2 className="font-semibold">Log a session</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-[1fr_96px] gap-3">
              <div className="grid gap-2">
                <Label htmlFor="h-date">Date</Label>
                <Input id="h-date" name="date" type="date" required defaultValue={today()} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="h-hours">Hours</Label>
                <Input id="h-hours" name="hours" type="number" min={0.25} max={24} step={0.25} required defaultValue={2} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="h-home">Foster home</Label>
              <select
                id="h-home"
                name="home"
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-navy-800 focus-visible:border-amber-500 focus-visible:ring-4 focus-visible:ring-amber-500/15 focus-visible:ring-offset-0"
              >
                {homes.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="h-activity">What did you do?</Label>
              <Input id="h-activity" name="activity" required maxLength={120} placeholder="Homework tutoring" />
            </div>
            <Button type="submit" variant="accent">
              Add to log
            </Button>
          </div>
        </form>
        <p className="px-2 text-xs text-navy-400">
          Your log is saved in this browser only. Print it or save it as a PDF to turn in.
        </p>
      </aside>

      {/* Printable log */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <p className="text-sm text-navy-500">Preview of your printable log</p>
          <Button variant="outline" onClick={() => window.print()} disabled={state.entries.length === 0}>
            Print / save PDF
          </Button>
        </div>

        <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-soft sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex items-start justify-between gap-6 border-b border-cream-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <LogoMark className="h-7 w-7" />
                <span className="font-bold text-navy-800">
                  Home<span className="text-amber-500">Bridge</span>
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-bold">Community Service Hours Log</h2>
              <p className="mt-1 text-sm text-navy-500">
                {state.volunteer || "Volunteer name"}
                {state.school && ` · ${state.school}`}
              </p>
            </div>
            <div className="rounded-2xl bg-navy-800 px-5 py-4 text-right text-cream print:bg-white print:text-navy-800 print:ring-1 print:ring-navy-200">
              <p className="text-xs text-navy-300 print:text-navy-500">Total hours</p>
              <p className="text-3xl font-bold tabular-nums">{total % 1 ? total.toFixed(2) : total}</p>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="font-medium text-navy-700">No sessions logged yet</p>
              <p className="mt-1 max-w-xs text-sm text-navy-500">Add your first volunteer session with the form.</p>
            </div>
          ) : (
            <div className="-mx-2 overflow-x-auto px-2" data-lenis-prevent>
              <table className="mt-4 w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-navy-400">
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">Foster home</th>
                    <th className="py-3 pr-4 font-semibold">Activity</th>
                    <th className="py-3 pr-2 text-right font-semibold">Hours</th>
                    <th className="w-16 print:hidden" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  <AnimatePresence initial={false}>
                    {sorted.map((e) => (
                      <motion.tr
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-navy-700"
                      >
                        <td className="whitespace-nowrap py-3 pr-4">{fmtDate(e.date)}</td>
                        <td className="py-3 pr-4">{e.home}</td>
                        <td className="py-3 pr-4">{e.activity}</td>
                        <td className="py-3 pr-2 text-right font-semibold tabular-nums text-navy-800">{e.hours}</td>
                        <td className="py-3 text-right print:hidden">
                          <button
                            onClick={() => remove(e.id)}
                            className="text-xs font-medium text-navy-400 underline-offset-4 hover:text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {["Volunteer signature", "Supervisor signature & date"].map((l) => (
              <div key={l}>
                <div className="h-10 border-b border-navy-300" />
                <p className="mt-2 text-xs text-navy-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
