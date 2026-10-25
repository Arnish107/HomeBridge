import type { Metadata } from "next";
import { getHomes } from "@/lib/homes";
import { NEED_CATEGORIES, type NeedCategory } from "@/lib/types";
import { HomesBrowser } from "@/components/homes-browser";
import { Reveal } from "@/components/motion";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse homes",
  description: "Find a verified foster home near you and see exactly what they need.",
};

export default async function BrowseHomesPage({ searchParams }: { searchParams: { category?: string } }) {
  const homes = await getHomes();
  const initial = NEED_CATEGORIES.some((c) => c.value === searchParams.category)
    ? (searchParams.category as NeedCategory)
    : "all";

  return (
    <div className="container pt-10 md:pt-16">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Browse homes</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tightest sm:text-5xl lg:text-6xl">Find a home to help</h1>
        <p className="mt-5 text-lg text-navy-600">
          Every home here has been verified by our team. Filter by what you can give, or search for a home near you.
        </p>
      </Reveal>
      <div className="mt-12">
        <HomesBrowser homes={homes} initialCategory={initial} />
      </div>
    </div>
  );
}
