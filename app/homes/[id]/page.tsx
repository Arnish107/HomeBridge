import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHome } from "@/lib/homes";
import { NEED_CATEGORIES, type Need } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { ShareButton } from "@/components/share-button";
import { HomePhoto, PhotoCredit } from "@/components/home-photo";
import { ContactDialog } from "@/components/forms/contact-dialog";
import { SignupDialog } from "@/components/forms/signup-dialog";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const home = await getHome(id);
  return home ? { title: home.name, description: home.description } : { title: "Home not found" };
}

function NeedRow({ need }: { need: Need }) {
  return (
    <li className={`flex items-center gap-4 py-4 ${need.fulfilled ? "opacity-60" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-serif text-[1.55rem] leading-tight text-navy-900 ${need.fulfilled ? "line-through decoration-navy-300" : ""}`}>
            {need.title}
          </p>
          {need.urgent && !need.fulfilled && <Badge variant="urgent">Urgent</Badge>}
          {need.fulfilled && <Badge variant="success">Fulfilled</Badge>}
        </div>
        {need.note && <p className="mt-0.5 text-sm text-navy-500">{need.note}</p>}
      </div>
      {!need.fulfilled && (
        <Button asChild size="sm" variant={need.urgent ? "accent" : "outline"}>
          <a href={need.wishlistUrl} target="_blank" rel="noopener noreferrer">
            Give
          </a>
        </Button>
      )}
    </li>
  );
}

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = await getHome(id);
  if (!home) notFound();

  const open = home.needs.filter((n) => !n.fulfilled);
  const urgentCount = open.filter((n) => n.urgent).length;
  const groups = NEED_CATEGORIES.map((c) => ({
    ...c,
    needs: home.needs
      .filter((n) => n.category === c.value)
      .sort((a, b) => Number(a.fulfilled) - Number(b.fulfilled) || Number(b.urgent) - Number(a.urgent)),
  })).filter((g) => g.needs.length > 0);
  const updated = timeAgo(home.updatedAt);

  return (
    <div className="container pb-8 pt-6 md:pt-10">
      <Link href="/homes" className="text-sm font-medium text-navy-500 transition-colors hover:text-navy-800">
        ← All homes
      </Link>

      {/* Header */}
      <header className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <Reveal>
          <p className="eyebrow">
            {home.area} · Verified home{updated && ` · Updated ${updated}`}
          </p>
          <h1 className="display mt-5 text-[clamp(3.4rem,9vw,8.5rem)]">{home.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-600">{home.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap gap-2 lg:justify-end">
          <ShareButton
            title={`${home.name} on HomeBridge`}
            text={`${home.name} in ${home.area} could use some help. Here's what they need:`}
            path={`/homes/${home.id}`}
            variant="outline"
          />
          <Button asChild variant="outline">
            <Link href={`/homes/${home.id}/flyer`}>Print a flyer</Link>
          </Button>
        </Reveal>
      </header>

      <Reveal delay={0.05} className="mt-10">
        <div className="relative h-56 overflow-hidden rounded-xl shadow-soft sm:h-80 lg:h-[26rem]">
          <HomePhoto home={home} width={1600} priority />
        </div>
        <PhotoCredit home={home} className="mt-2" />
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="min-w-0 space-y-16">
          {/* Needs */}
          <section>
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Needs list</p>
                <h2 className="display mt-3 text-[clamp(2.4rem,4.4vw,3.75rem)]">What {home.name} needs</h2>
              </div>
            </Reveal>
            <p className="mt-3 max-w-xl text-sm text-navy-500">
              &ldquo;Give&rdquo; opens the home&apos;s Amazon wish list. Items ship directly to them, so you never need
              an address.
            </p>

            <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
              {groups.map((g) => (
                <div key={g.value}>
                  <div className="flex items-baseline justify-between border-b border-navy-900/80 pb-2">
                    <h3 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] text-navy-700">{g.label}</h3>
                    <span className="font-mono text-[0.7rem] text-navy-500">{g.needs.filter((n) => !n.fulfilled).length} open</span>
                  </div>
                  <ul className="divide-y divide-navy-900/15">
                    {g.needs.map((n) => (
                      <NeedRow key={n.id} need={n} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Volunteer */}
          <section id="volunteer">
            <Reveal>
              <p className="eyebrow">Volunteer</p>
              <h2 className="display mt-3 text-[clamp(2.4rem,4.4vw,3.75rem)]">Give your time</h2>
            </Reveal>
            {home.opportunities.length === 0 ? (
              <p className="mt-6 text-navy-500">No open volunteer roles right now. Check back soon.</p>
            ) : (
              <ul className="mt-10 divide-y divide-navy-900/15 border-y border-navy-900/15">
                {home.opportunities.map((o) => (
                  <li key={o.id}>
                    <div className="grid gap-3 py-6 sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-6">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber-700">{o.schedule}</p>
                      <div className="min-w-0">
                        <h3 className="font-serif text-[1.9rem] font-normal leading-none">{o.title}</h3>
                        <p className="mt-1 text-sm text-navy-500">{o.description}</p>
                      </div>
                      <SignupDialog
                        homeId={home.id}
                        homeName={home.name}
                        opportunity={o}
                        triggerProps={{ size: "default", className: "justify-self-start" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.15}>
            <div className="rounded-lg bg-navy-900 p-6 text-cream sm:p-7">
              <dl className="grid grid-cols-3 divide-x divide-white/10">
                {[
                  { k: "Open needs", v: open.length },
                  { k: "Urgent", v: urgentCount },
                  { k: "Roles", v: home.opportunities.length },
                ].map((s, i) => (
                  <div key={s.k} className={i === 0 ? "pr-3" : "px-3"}>
                    <dd className="font-serif text-5xl leading-none">{s.v}</dd>
                    <dt className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-navy-300">{s.k}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-7 grid gap-2">
                <ContactDialog
                  homeId={home.id}
                  homeName={home.name}
                  triggerProps={{ variant: "accent", size: "lg", className: "w-full" }}
                />
                <Button asChild variant="ghost" className="w-full text-cream hover:bg-white/10 hover:text-cream">
                  <a href="#volunteer">See volunteer roles</a>
                </Button>
              </div>
              <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-relaxed text-navy-300">
                For the children&apos;s safety, HomeBridge shows only the general area and routes every message
                through the app.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
