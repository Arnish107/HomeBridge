"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { firebaseEnabled } from "@/lib/firebase";
import { logOut } from "@/lib/auth";
import { useAuth } from "@/lib/use-auth";
import {
  countDonation,
  findMyHome,
  getInbox,
  getMyRegistration,
  getSignups,
  markMessageRead,
  saveHome,
  type InboxMessage,
  type OwnedHome,
  type PendingHome,
  type Signup,
} from "@/lib/manage";
import { timeAgo } from "@/lib/time";
import { SetupNotice } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { NeedsEditor } from "./needs-editor";
import { RolesEditor } from "./roles-editor";
import { ProfileEditor } from "./profile-editor";
import { Empty } from "./empty";

type Tab = "needs" | "roles" | "profile" | "inbox" | "signups";

export function Dashboard() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [home, setHome] = useState<OwnedHome | null>(null);
  const [registration, setRegistration] = useState<PendingHome | null>(null);
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [tab, setTab] = useState<Tab>("needs");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!loading && !user && firebaseEnabled) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const h = await findMyHome(user.uid);
        setHome(h);
        if (h) {
          const [m, s] = await Promise.all([getInbox(h.id), getSignups(h.id)]);
          setInbox(m);
          setSignups(s);
        } else {
          setRegistration(await getMyRegistration(user.uid));
        }
        setState("ready");
      } catch (err) {
        console.error(err);
        setState("error");
      }
    })();
  }, [user]);

  /** Optimistically applies a change, then saves it. */
  const update = useCallback(
    async (next: OwnedHome, opts?: { donated?: boolean }) => {
      const prev = home;
      setHome(next);
      setSaving("saving");
      try {
        setHome(await saveHome(next));
        if (opts?.donated) await countDonation(next.id).catch(() => {});
        setSaving("saved");
        setTimeout(() => setSaving((s) => (s === "saved" ? "idle" : s)), 1800);
      } catch (err) {
        console.error(err);
        setHome(prev);
        setSaving("error");
      }
    },
    [home]
  );

  if (!firebaseEnabled)
    return (
      <Shell>
        <SetupNotice />
      </Shell>
    );

  if (loading || !user || state === "loading")
    return (
      <Shell>
        <div className="h-64 animate-pulse rounded-xl bg-cream-200" />
      </Shell>
    );

  if (state === "error")
    return (
      <Shell>
        <p className="text-destructive">We couldn&apos;t load your dashboard. Please refresh to try again.</p>
      </Shell>
    );

  if (!home)
    return (
      <Shell>
        <div className="max-w-xl rounded-xl border border-cream-200 bg-card p-8 shadow-soft">
          {isAdmin ? (
            <>
              <h1 className="font-serif text-[2.6rem] font-normal leading-none">You&apos;re signed in as the admin</h1>
              <p className="mt-2 text-navy-600">Review registration requests from new foster homes.</p>
              <Button asChild className="mt-6">
                <Link href="/admin">Open the review queue</Link>
              </Button>
            </>
          ) : registration?.status === "pending" ? (
            <>
              <p className="eyebrow">Under review</p>
              <h1 className="mt-2 font-serif text-[2.6rem] font-normal leading-none">Thanks, {registration.contactName.split(" ")[0]}!</h1>
              <p className="mt-2 text-navy-600">
                We&apos;re reviewing the registration for <strong>{registration.homeName}</strong>. You&apos;ll be able
                to manage your listing here as soon as it&apos;s approved.
              </p>
            </>
          ) : registration?.status === "rejected" ? (
            <>
              <h1 className="font-serif text-[2.6rem] font-normal leading-none">Registration not approved</h1>
              <p className="mt-2 text-navy-600">
                We weren&apos;t able to verify {registration.homeName}. Please contact the HomeBridge team if you think
                this is a mistake.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-[2.6rem] font-normal leading-none">No home linked to this account</h1>
              <p className="mt-2 text-navy-600">Register your foster home to start posting needs.</p>
              <Button asChild className="mt-6">
                <Link href="/register">Register your home</Link>
              </Button>
            </>
          )}
          <button
            onClick={() => logOut().then(() => router.push("/"))}
            className="mt-6 block text-sm font-medium text-navy-500 underline underline-offset-4"
          >
            Log out
          </button>
        </div>
      </Shell>
    );

  const unread = inbox.filter((m) => !m.read).length;
  const openNeeds = home.needs.filter((n) => !n.fulfilled).length;
  const updated = timeAgo(home.updatedAt);

  return (
    <Shell>
      <header className="flex flex-col justify-between gap-6 border-b border-cream-300 pb-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Foster home dashboard</p>
          <h1 className="display mt-4 text-[clamp(3rem,6.5vw,5.75rem)]">{home.name}</h1>
          <p className="mt-2 text-sm text-navy-500">
            {home.area} · {openNeeds} open needs · {home.opportunities.length} volunteer roles
            {updated && ` · Updated ${updated}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaveStatus state={saving} />
          <Button asChild variant="outline">
            <Link href={`/homes/${home.id}`} target="_blank">
              View public page
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => logOut().then(() => router.push("/"))}>
            Log out
          </Button>
        </div>
      </header>

      <nav className="-mx-5 mt-6 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        <Chip group="dash" active={tab === "needs"} onClick={() => setTab("needs")} count={openNeeds}>
          Needs
        </Chip>
        <Chip group="dash" active={tab === "roles"} onClick={() => setTab("roles")} count={home.opportunities.length}>
          Volunteer roles
        </Chip>
        <Chip group="dash" active={tab === "profile"} onClick={() => setTab("profile")}>
          Profile
        </Chip>
        <Chip group="dash" active={tab === "inbox"} onClick={() => setTab("inbox")} count={unread || undefined}>
          Inbox
        </Chip>
        <Chip group="dash" active={tab === "signups"} onClick={() => setTab("signups")} count={signups.length || undefined}>
          Sign-ups
        </Chip>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {tab === "needs" && <NeedsEditor home={home} onChange={update} />}
          {tab === "roles" && <RolesEditor home={home} onChange={update} />}
          {tab === "profile" && <ProfileEditor home={home} onChange={update} />}
          {tab === "inbox" && (
            <Inbox
              messages={inbox}
              onRead={async (id) => {
                setInbox((all) => all.map((m) => (m.id === id ? { ...m, read: true } : m)));
                await markMessageRead(id).catch(console.error);
              }}
            />
          )}
          {tab === "signups" && <Signups signups={signups} home={home} />}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container min-h-[60vh] pt-10 md:pt-14">{children}</div>;
}

function SaveStatus({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  const text = { idle: "", saving: "Saving…", saved: "All changes saved", error: "Couldn't save. Try again." }[state];
  return (
    <span
      aria-live="polite"
      className={`mr-2 text-sm ${state === "error" ? "text-destructive" : "text-navy-400"}`}
    >
      {text}
    </span>
  );
}

const fmt = (m?: { toDate(): Date }) =>
  m ? m.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

function Inbox({ messages, onRead }: { messages: InboxMessage[]; onRead: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!messages.length)
    return (
      <Empty title="No messages yet" body="When someone uses the Contact button on your public page, it shows up here." />
    );
  return (
    <ul className="divide-y divide-cream-300 border-y border-cream-300">
      {messages.map((m) => (
        <li key={m.id}>
          <button
            onClick={() => {
              setOpen(open === m.id ? null : m.id);
              if (!m.read) onRead(m.id);
            }}
            className="flex w-full items-baseline gap-4 py-4 text-left"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-amber-500"}`} />
            <span className={`w-40 shrink-0 truncate ${m.read ? "text-navy-600" : "font-semibold text-navy-800"}`}>
              {m.name}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-navy-500">{m.message}</span>
            <span className="shrink-0 text-xs text-navy-400">{fmt(m.createdAt)}</span>
          </button>
          {open === m.id && (
            <div className="mb-4 ml-6 rounded-xl bg-card p-5 shadow-soft">
              <p className="whitespace-pre-wrap text-navy-700">{m.message}</p>
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message on HomeBridge")}`}
                className="mt-4 inline-block text-sm font-semibold text-navy-800 underline underline-offset-4"
              >
                Reply to {m.email}
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Signups({ signups, home }: { signups: Signup[]; home: OwnedHome }) {
  if (!signups.length)
    return <Empty title="No sign-ups yet" body="Volunteers who sign up for one of your roles will appear here." />;
  const role = (id: string) => home.opportunities.find((o) => o.id === id)?.title ?? "Removed role";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-cream-300 text-xs uppercase tracking-wider text-navy-400">
            <th className="py-3 pr-4 font-semibold">Volunteer</th>
            <th className="py-3 pr-4 font-semibold">Role</th>
            <th className="py-3 pr-4 font-semibold">Hours / month</th>
            <th className="py-3 font-semibold">Signed up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-200">
          {signups.map((s) => (
            <tr key={s.id} className="align-top">
              <td className="py-3 pr-4">
                <p className="font-medium text-navy-800">{s.name}</p>
                <a href={`mailto:${s.email}`} className="text-navy-500 underline-offset-2 hover:underline">
                  {s.email}
                </a>
                {s.message && <p className="mt-1 max-w-sm text-navy-500">&ldquo;{s.message}&rdquo;</p>}
              </td>
              <td className="py-3 pr-4 text-navy-700">{role(s.opportunityId)}</td>
              <td className="py-3 pr-4 tabular-nums text-navy-700">{s.hours}</td>
              <td className="py-3 text-navy-500">{fmt(s.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
