import Link from "next/link";
import type { FosterHome } from "@/lib/types";
import { categoryLabel } from "@/lib/types";
import { openNeeds, urgentNeeds } from "@/lib/needs";
import { timeAgo } from "@/lib/time";
import { HomePhoto } from "./home-photo";

export function HomeCard({ home }: { home: FosterHome; index?: number }) {
  const open = openNeeds(home);
  const urgent = urgentNeeds(home);
  const headline = urgent[0] ?? open[0];
  const updated = timeAgo(home.updatedAt);

  return (
    <Link
      href={`/homes/${home.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-cream-300 hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <HomePhoto home={home} width={720} />
        </div>
        {urgent.length > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-amber-700 shadow-sm">
            Urgent need
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold">{home.name}</h3>
          {updated && <span className="shrink-0 text-xs text-navy-400">Updated {updated}</span>}
        </div>
        <p className="text-sm text-navy-500">{home.area}</p>

        {headline && (
          <div className="mt-4 border-l-2 border-amber-500 pl-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-navy-400">
              {headline.urgent ? "Most urgent" : "Top need"} · {categoryLabel(headline.category)}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-navy-800">{headline.title}</p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-cream-200 pt-4 text-xs text-navy-500">
          <span>
            <strong className="font-semibold text-navy-800">{open.length}</strong> open needs ·{" "}
            <strong className="font-semibold text-navy-800">{home.opportunities.length}</strong> volunteer{" "}
            {home.opportunities.length === 1 ? "role" : "roles"}
          </span>
          <span className="font-semibold text-navy-800 transition-transform duration-300 group-hover:translate-x-1">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
