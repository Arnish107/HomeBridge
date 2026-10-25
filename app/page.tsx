import { getHomes } from "@/lib/homes";
import { getImpact } from "@/lib/impact";
import { openNeeds, urgentNeeds } from "@/lib/needs";
import { Hero } from "@/components/home/hero";
import { NeedsLedger } from "@/components/home/needs-ledger";
import { HomeIndex } from "@/components/home/home-index";
import { Impact } from "@/components/home/impact";
import { HowItWorks } from "@/components/home/how-it-works";
import { Closing } from "@/components/home/closing";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homes, impact] = await Promise.all([getHomes(), getImpact()]);
  const heroPhoto = (homes.find((h) => h.id === "sunshine-home") ?? homes.find((h) => h.photo))?.photo;

  return (
    <>
      <Hero
        photo={heroPhoto}
        openNeeds={homes.reduce((n, h) => n + openNeeds(h).length, 0)}
        urgentNeeds={homes.reduce((n, h) => n + urgentNeeds(h).length, 0)}
        homeCount={homes.length}
        roleCount={homes.reduce((n, h) => n + h.opportunities.length, 0)}
      />
      <NeedsLedger homes={homes} />
      <HomeIndex homes={homes} />
      <HowItWorks />
      <Impact homes={homes} stats={impact} />
      <Closing />
    </>
  );
}
