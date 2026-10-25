import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHome } from "@/lib/homes";
import { categoryLabel } from "@/lib/types";
import { FlyerQR, PrintButton } from "@/components/flyer-qr";

// Always render fresh so a foster home's dashboard edits show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const home = await getHome(id);
  return { title: home ? `Flyer: ${home.name}` : "Flyer" };
}

export default async function FlyerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = await getHome(id);
  if (!home) notFound();

  const needs = home.needs
    .filter((n) => !n.fulfilled)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent))
    .slice(0, 6);

  return (
    <div className="container py-8 print:max-w-none print:p-0">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <Link href={`/homes/${home.id}`} className="text-sm font-medium text-navy-500 hover:text-navy-800">
            ← Back to {home.name}
          </Link>
          <p className="mt-2 max-w-lg text-sm text-navy-600">
            Post this at schools, churches, and community boards. Anyone can scan the code to see what {home.name}{" "}
            needs right now.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Printable sheet */}
      <article className="mx-auto flex aspect-[8.5/11] w-full max-w-[680px] flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-lift print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="bg-navy-800 px-8 pb-10 pt-8 text-cream sm:px-12">
          <p className="font-bold">
            Home<span className="text-amber-400">Bridge</span>
          </p>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
            Neighbors helping neighbors
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-cream sm:text-5xl">Help {home.name}</h1>
          <p className="mt-3 text-navy-200">A local foster home in {home.area}</p>
        </div>

        <div className="grid flex-1 gap-8 px-8 py-8 sm:grid-cols-[1fr_auto] sm:px-12">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-400">What they need</h2>
            <ol className="mt-4 divide-y divide-cream-200 border-y border-cream-200">
              {needs.map((n, i) => (
                <li key={n.id} className="flex items-baseline gap-4 py-3">
                  <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-amber-600">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-800">
                      {n.title}
                      {n.urgent && (
                        <span className="ml-2 text-[0.65rem] font-bold uppercase tracking-wider text-amber-700">
                          Urgent
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-navy-400">{categoryLabel(n.category)}</p>
                  </div>
                </li>
              ))}
            </ol>
            {home.opportunities.length > 0 && (
              <p className="mt-6 text-sm text-navy-600">
                <strong className="text-navy-800">Volunteers wanted:</strong>{" "}
                {home.opportunities.map((o) => o.title).join(", ")}.
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-cream-100 p-5 sm:self-start">
            <FlyerQR path={`/homes/${home.id}`} size={170} />
            <p className="mt-3 text-center text-sm font-semibold text-navy-800">Scan to give or volunteer</p>
          </div>
        </div>

        <footer className="border-t border-cream-200 px-8 py-4 text-xs text-navy-400 sm:px-12">
          Gifts ship directly from the home&apos;s wish list. No addresses are shared. Learn more at HomeBridge.
        </footer>
      </article>
    </div>
  );
}
