import Link from "next/link";
import { getHomes } from "@/lib/homes";
import { getImpact } from "@/lib/impact";
import { ImpactCounter } from "@/components/impact-counter";
import { Hero } from "@/components/home/hero";
import { FeaturedNeeds } from "@/components/home/featured-needs";
import { HomeCard } from "@/components/home-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Find a home",
    body: "Browse verified foster homes near you and see exactly what they need right now.",
  },
  {
    title: "Send what's needed",
    body: "Each need links to the home's wish list. Your gift ships straight to their door.",
  },
  {
    title: "Show up in person",
    body: "Sign up to tutor, cook, or mentor, and log your community service hours as you go.",
  },
];

export default async function HomePage() {
  const [homes, impact] = await Promise.all([getHomes(), getImpact()]);

  return (
    <>
      <Hero homes={homes} />

      <ImpactCounter stats={impact} />

      <div className="h-20 md:h-28" />

      <FeaturedNeeds homes={homes} />

      {/* Homes grid */}
      <section className="container py-20 md:py-28">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Foster homes</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Homes in your community</h2>
            <p className="mt-4 text-navy-600">
              Every home on HomeBridge is reviewed before it goes live. We only ever show the general area.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/homes">Browse all homes</Link>
          </Button>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homes.slice(0, 5).map((home) => (
            <StaggerItem key={home.id} className="h-full">
              <HomeCard home={home} />
            </StaggerItem>
          ))}
          <StaggerItem className="h-full">
            <Link
              href="/register"
              className="group flex h-full min-h-[300px] flex-col justify-end rounded-2xl border-2 border-dashed border-cream-300 p-6 transition-colors hover:border-amber-400 hover:bg-amber-50/50"
            >
              <p className="eyebrow">For foster homes</p>
              <h3 className="mt-3 text-2xl font-bold">Run a foster home?</h3>
              <p className="mt-2 text-sm text-navy-600">
                Register to post your needs and volunteer roles. Our team reviews every request.
              </p>
              <span className="mt-5 text-sm font-semibold text-navy-800">
                Register your home{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </StaggerItem>
        </Stagger>
      </section>

      {/* How it works */}
      <section className="border-y border-cream-200 bg-cream-100/70 py-20 md:py-24">
        <div className="container">
          <Reveal className="max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Helping takes about five minutes</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title} className="border-t-2 border-navy-800 pt-6">
                <span className="text-5xl font-bold tracking-tightest text-amber-500 tabular-nums">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy-600">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container pt-20 md:pt-28">
        <Reveal>
          <div className="rounded-[2rem] bg-amber-500 px-6 py-14 text-center sm:px-12 md:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-navy-900 sm:text-5xl">
              A coat, a notebook, a Tuesday afternoon.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-navy-800/80">
              Small things add up to a child feeling seen. Pick one way to help today.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/homes">Find a home to help</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy-900/20 bg-white/40 hover:bg-white/70">
                <Link href="/near-me">Homes near me</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
