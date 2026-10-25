"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { firebaseEnabled } from "@/lib/firebase";
import { logOut } from "@/lib/auth";
import { useAuth } from "@/lib/use-auth";
import { approveRegistration, getPendingQueue, PLACES, rejectRegistration, type PendingHome } from "@/lib/manage";
import { SetupNotice } from "./auth-shell";
import { Button } from "./ui/button";
import { Select } from "./dashboard/select";
import { Empty } from "./dashboard/empty";

export function AdminQueue() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [queue, setQueue] = useState<PendingHome[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; id?: string; approved: boolean }[]>([]);

  useEffect(() => {
    if (!loading && !user && firebaseEnabled) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    getPendingQueue()
      .then(setQueue)
      .catch((err) => {
        console.error(err);
        setError("Couldn't load the queue. Check that the security rules were published with `npm run setup`.");
      });
  }, [isAdmin]);

  if (!firebaseEnabled) return <SetupNotice />;
  if (loading || !user) return <div className="h-64 animate-pulse rounded-3xl bg-cream-200" />;
  if (!isAdmin)
    return (
      <div className="max-w-lg rounded-3xl border border-cream-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-navy-600">This page is for the HomeBridge review team.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to your dashboard</Link>
        </Button>
      </div>
    );

  async function act(p: PendingHome, approve: boolean, place: string) {
    try {
      const home = approve ? await approveRegistration(p, place) : (await rejectRegistration(p.uid), undefined);
      setQueue((q) => q?.filter((x) => x.uid !== p.uid) ?? null);
      setDone((d) => [{ name: p.homeName, id: home?.id, approved: approve }, ...d]);
    } catch (err) {
      console.error(err);
      setError(`Couldn't update ${p.homeName}. Please try again.`);
    }
  }

  return (
    <>
      <header className="flex flex-col justify-between gap-6 border-b border-cream-300 pb-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tightest sm:text-5xl">Registration queue</h1>
          <p className="mt-2 text-sm text-navy-500">
            Verify each home&apos;s license before approving. Approved homes go live immediately.
          </p>
        </div>
        <Button variant="ghost" onClick={() => logOut().then(() => router.push("/"))}>
          Log out
        </Button>
      </header>

      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {done.length > 0 && (
        <ul className="mt-6 space-y-1 text-sm text-navy-600">
          {done.map((d) => (
            <li key={d.name}>
              {d.approved ? "Approved" : "Rejected"} <strong className="text-navy-800">{d.name}</strong>
              {d.id && (
                <>
                  {" · "}
                  <Link href={`/homes/${d.id}`} className="underline underline-offset-4">
                    view listing
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        {queue === null ? (
          <div className="h-40 animate-pulse rounded-3xl bg-cream-200" />
        ) : queue.length === 0 ? (
          <Empty title="Nothing to review" body="New registration requests from /register will show up here." />
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {queue.map((p) => (
                <motion.li key={p.uid} layout exit={{ opacity: 0, x: 24 }}>
                  <Request p={p} onAct={act} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );
}

function Request({ p, onAct }: { p: PendingHome; onAct: (p: PendingHome, approve: boolean, place: string) => void }) {
  const guess = PLACES.find((x) => p.area.toLowerCase().includes(x.label.split(",")[0].toLowerCase()));
  const [place, setPlace] = useState(guess?.label ?? PLACES[0].label);
  const [busy, setBusy] = useState(false);

  const rows: [string, string][] = [
    ["Contact", p.contactName],
    ["Email", p.email],
    ["Phone", p.phone],
    ["Area", `${p.area} ${p.zip}`],
    ["License #", p.licenseNumber],
  ];

  return (
    <div className="grid gap-6 rounded-3xl border border-cream-200 bg-white p-6 shadow-soft lg:grid-cols-[1fr_280px]">
      <div>
        <h2 className="text-xl font-bold">{p.homeName}</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[110px_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-navy-400">{k}</dt>
              <dd className="text-navy-800">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-navy-600">{p.description}</p>
      </div>
      <div className="flex flex-col gap-3 border-t border-cream-200 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <label htmlFor={`place-${p.uid}`} className="text-sm font-medium text-navy-700">
          Map pin (city center)
        </label>
        <Select id={`place-${p.uid}`} value={place} onChange={(e) => setPlace(e.target.value)}>
          {PLACES.map((x) => (
            <option key={x.label}>{x.label}</option>
          ))}
        </Select>
        <Button
          variant="accent"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            onAct(p, true, place);
          }}
        >
          Approve and publish
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          className="text-navy-500 hover:text-red-600"
          onClick={() => {
            if (!confirm(`Reject ${p.homeName}?`)) return;
            setBusy(true);
            onAct(p, false, place);
          }}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
