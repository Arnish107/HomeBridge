import type { Metadata } from "next";
import { getHomes } from "@/lib/homes";
import { VolunteerBoard } from "@/components/volunteer-board";
import { Reveal } from "@/components/motion";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Tutor, cook, mentor, or help at events with local foster homes, and track your service hours.",
};

export default async function VolunteerPage() {
  const homes = await getHomes();

  return (
    <div className="container pt-10 md:pt-16">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Volunteer</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tightest sm:text-5xl lg:text-6xl">Give an afternoon</h1>
        <p className="mt-5 text-lg text-navy-600">
          Homework help, a home-cooked meal, an hour of mentoring. Pick something that fits your week and the home
          will confirm with you directly.
        </p>
      </Reveal>
      <div className="mt-12">
        <VolunteerBoard homes={homes} />
      </div>
    </div>
  );
}
