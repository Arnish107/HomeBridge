import Link from "next/link";
import type { FosterHome } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export function FeaturedNeeds({ homes }: { homes: FosterHome[] }) {
  // Urgent items first, then one top item from each remaining home, up to 6.
  const all = homes.flatMap((home) => home.needs.filter((n) => !n.fulfilled).map((need) => ({ home, need })));
  const urgent = all.filter((x) => x.need.urgent);
  const rest = homes
    .map((home) => all.find((x) => x.home.id === home.id && !x.need.urgent))
    .filter((x): x is (typeof all)[number] => Boolean(x));
  const featured = [...urgent, ...rest].slice(0, 6);

  return (
    <section id="featured-needs" className="bg-navy-800 py-20 text-cream md:py-28">
      <div className="container">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow text-amber-400">Featured needs</p>
            <h2 className="mt-3 text-3xl font-bold text-cream sm:text-4xl">What homes need most this week</h2>
            <p className="mt-4 text-navy-200">
              Each item links to the home&apos;s wish list, so your gift ships directly to them. No guesswork, no
              drop-off.
            </p>
          </div>
          <Link href="/homes" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
            See every home →
          </Link>
        </Reveal>

        <Stagger className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {featured.map(({ home, need }, i) => (
            <StaggerItem key={`${home.id}-${need.id}`} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <div className="flex h-full flex-col rounded-2xl border border-white/10 p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.03]">
                <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
                  <span className="tabular-nums text-navy-400">{String(i + 1).padStart(2, "0")}</span>
                  {need.urgent ? (
                    <span className="text-amber-400">Urgent</span>
                  ) : (
                    <span className="text-navy-300">{categoryLabel(need.category)}</span>
                  )}
                </div>
                <h3 className="mt-8 text-xl font-semibold text-cream">{need.title}</h3>
                <Link
                  href={`/homes/${home.id}`}
                  className="mt-1 text-sm text-navy-300 underline-offset-4 hover:text-cream hover:underline"
                >
                  {home.name}, {home.area}
                </Link>
                <a
                  href={need.wishlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto self-start pt-8 text-sm font-semibold text-amber-400 underline-offset-4 hover:text-amber-300 hover:underline"
                >
                  Give via wish list →
                </a>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
