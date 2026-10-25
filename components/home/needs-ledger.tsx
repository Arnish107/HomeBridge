import Link from "next/link";
import type { FosterHome } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

/** Urgent needs first, then one top need from each other home. */
function pickNeeds(homes: FosterHome[], max = 6) {
  const all = homes.flatMap((home) => home.needs.filter((n) => !n.fulfilled).map((need) => ({ home, need })));
  const urgent = all.filter((x) => x.need.urgent);
  const rest = homes
    .map((home) => all.find((x) => x.home.id === home.id && !x.need.urgent))
    .filter((x): x is (typeof all)[number] => Boolean(x));
  return [...urgent, ...rest].slice(0, max);
}

export function NeedsLedger({ homes }: { homes: FosterHome[] }) {
  const rows = pickNeeds(homes);

  return (
    <section aria-labelledby="needs-title" className="container pt-32 md:pt-44">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="needs-title" className="display text-[clamp(2.8rem,6.4vw,6.5rem)] md:col-span-8">
          What homes are short on this week.
        </h2>
        <p className="max-w-sm text-navy-600 md:col-span-4 md:justify-self-end">
          Each item opens the home&apos;s own wish list. Your gift ships straight to them, and nobody needs an address.
        </p>
      </div>

      <ul className="mt-14 border-t border-navy-900/80">
        {rows.map(({ home, need }) => (
          <li key={`${home.id}-${need.id}`} className="group relative border-b border-navy-900/15">
            {need.urgent && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-amber-500" />}
            <div className="grid gap-x-8 gap-y-2 py-6 pl-5 pr-2 transition-colors duration-300 group-hover:bg-cream-100 md:grid-cols-12 md:items-baseline md:py-7">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] md:col-span-2">
                {need.urgent ? (
                  <span className="font-semibold text-amber-700">Urgent</span>
                ) : (
                  <span className="text-navy-500">{categoryLabel(need.category)}</span>
                )}
              </p>
              <h3 className="font-serif text-[clamp(1.8rem,3.2vw,2.75rem)] font-normal leading-[1.05] text-navy-900 transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:col-span-5">
                {need.title}
              </h3>
              <Link
                href={`/homes/${home.id}`}
                className="text-[0.95rem] text-navy-600 underline decoration-navy-900/20 underline-offset-4 hover:text-navy-900 hover:decoration-navy-900 md:col-span-3"
              >
                {home.name}, {home.area}
              </Link>
              <a
                href={need.wishlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="justify-self-start text-[0.95rem] font-medium text-navy-900 underline decoration-amber-500 decoration-2 underline-offset-[6px] transition-colors hover:text-amber-700 md:col-span-2 md:justify-self-end"
              >
                Give this
                <span className="sr-only"> to {home.name} (opens wish list)</span>
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-end">
        <Link href="/homes" className="text-[0.95rem] text-navy-700 underline decoration-navy-900/25 underline-offset-4 hover:text-navy-900">
          See every home and need
        </Link>
      </div>
    </section>
  );
}
