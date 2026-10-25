import type { Metadata } from "next";
import { getHomes } from "@/lib/homes";
import { NearMe } from "@/components/near-me";
import { Reveal } from "@/components/motion";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find near me",
  description: "Find foster homes near your ZIP code or city.",
};

export default async function NearMePage() {
  const homes = await getHomes();

  return (
    <div className="container pt-10 md:pt-16">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Find near me</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tightest sm:text-5xl lg:text-6xl">Homes close to you</h1>
        <p className="mt-5 text-lg text-navy-600">
          Enter a ZIP code or city to see foster homes in your area. Helping close to home makes it easier to show
          up.
        </p>
      </Reveal>
      <div className="mt-12">
        <NearMe homes={homes} />
      </div>
    </div>
  );
}
