import type { Metadata } from "next";
import { getHomes } from "@/lib/homes";
import { HoursLog } from "@/components/hours-log";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Service hours log",
  description: "Track and print your community service hours from volunteering with HomeBridge foster homes.",
};

export default async function HoursPage() {
  const homes = await getHomes();

  return (
    <div className="container pb-8 pt-10 md:pt-14 print:p-0">
      <Reveal className="max-w-2xl print:hidden">
        <p className="eyebrow">Community service</p>
        <h1 className="display mt-4 text-[clamp(3rem,6.5vw,5.75rem)]">Your service hours log</h1>
        <p className="mt-4 text-lg text-navy-600">
          Log each session as you go, then print a signed record for school, a club, or a scholarship application.
        </p>
      </Reveal>
      <div className="mt-10 print:mt-0">
        <HoursLog homes={homes.map((h) => h.name)} />
      </div>
    </div>
  );
}
