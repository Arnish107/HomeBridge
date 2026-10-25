import type { FosterHome, ImpactStats } from "@/lib/types";
import { openNeeds } from "@/lib/needs";

/**
 * Two kinds of numbers, never mixed:
 *  - "Live now" is counted from the listings themselves, so it is true by construction.
 *  - The pilot counters include seeded demonstration values and are labelled as such.
 */
export function Impact({ homes, stats }: { homes: FosterHome[]; stats: ImpactStats }) {
  const live = [
    { value: homes.length, label: "verified homes listed" },
    { value: homes.reduce((n, h) => n + openNeeds(h).length, 0), label: "needs open right now" },
    { value: homes.reduce((n, h) => n + h.opportunities.length, 0), label: "volunteer roles posted" },
  ];
  const pilot = [
    { value: stats.itemsDonated, label: "items marked fulfilled" },
    { value: stats.volunteersSignedUp, label: "volunteer sign-ups" },
    { value: stats.hoursVolunteered, label: "hours pledged" },
  ];

  return (
    <section aria-labelledby="impact-title" className="container pt-32 md:pt-44">
      <h2 id="impact-title" className="display max-w-4xl text-[clamp(2.8rem,6.4vw,6.5rem)]">
        Counted, not claimed.
      </h2>

      <div className="mt-14 border-t border-navy-900/80">
        <p className="eyebrow pt-4">Live now, from the listings</p>
        <dl className="grid md:grid-cols-3">
          {live.map((s, i) => (
            <div key={s.label} className={`py-8 md:py-10 ${i > 0 ? "border-t border-navy-900/15 md:border-l md:border-t-0 md:pl-10" : ""}`}>
              <dd className="font-serif text-[clamp(5rem,11vw,10rem)] leading-[0.8] tracking-[-0.03em] text-navy-900">{s.value}</dd>
              <dt className="mt-4 text-navy-700">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 grid gap-6 rounded-lg bg-cream-100 p-6 md:grid-cols-12 md:items-center md:p-8">
        <div className="md:col-span-4">
          <p className="eyebrow">Pilot counters</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            These include seeded demonstration figures from our pilot. They are not verified charitable impact.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 md:col-span-8">
          {pilot.map((s) => (
            <div key={s.label}>
              <dd className="font-serif text-4xl leading-none text-navy-700 md:text-5xl">{s.value.toLocaleString()}</dd>
              <dt className="mt-2 text-sm text-navy-600">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
