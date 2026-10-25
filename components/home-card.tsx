import Link from "next/link";
import type { FosterHome } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { openNeeds, urgentNeeds } from "@/lib/needs";
import { timeAgo } from "@/lib/time";
import { HomePhoto } from "./home-photo";

/** An editorial entry for a home: photo, name, and the one need that matters most. */
export function HomeCard({ home }: { home: FosterHome; index?: number }) {
  const open = openNeeds(home);
  const urgent = urgentNeeds(home);
  const headline = urgent[0] ?? open[0];
  const updated = timeAgo(home.updatedAt);

  return (
    <Link href={`/homes/${home.id}`} className="group block h-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-200">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <HomePhoto home={home} width={720} />
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-[2.1rem] font-normal leading-none text-navy-900 underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-navy-900/40">
          {home.name}
        </h3>
        <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-navy-500">
          {home.area.replace(/, GA$/, "")}
        </span>
      </div>

      {headline && (
        <div className={`mt-4 border-l-[3px] pl-3 ${headline.urgent ? "border-amber-500" : "border-navy-900/15"}`}>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-navy-500">
            {headline.urgent ? <span className="font-semibold text-amber-700">Most urgent</span> : `Top need, ${categoryLabel(headline.category).toLowerCase()}`}
          </p>
          <p className="mt-1 text-navy-900">{headline.title}</p>
        </div>
      )}

      <p className="mt-4 border-t border-navy-900/15 pt-3 text-sm text-navy-600">
        {open.length} open {open.length === 1 ? "need" : "needs"}, {home.opportunities.length} volunteer{" "}
        {home.opportunities.length === 1 ? "role" : "roles"}
        {updated && <span className="text-navy-500"> · updated {updated}</span>}
      </p>
    </Link>
  );
}
