"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { FosterHome } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function Hero({ homes }: { homes: FosterHome[] }) {
  const open = homes.flatMap((h) => h.needs.filter((n) => !n.fulfilled).map((need) => ({ home: h, need })));
  const urgent = open.filter((x) => x.need.urgent);
  // Show urgent needs first, then fill the list from other homes.
  const list = [...urgent, ...open.filter((x) => !x.need.urgent)].slice(0, 4);

  return (
    <section className="relative">
      <div className="container grid items-center gap-14 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28">
        <div className="max-w-xl">
          <motion.p {...rise(0)} className="eyebrow">
            Foster care support in North Metro Atlanta
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-5 text-[2.6rem] font-bold leading-[1.04] tracking-tightest sm:text-6xl lg:text-[4.1rem]"
          >
            Every kid deserves to feel{" "}
            <span className="underline decoration-amber-500 decoration-[0.09em] underline-offset-[0.14em]">
              at home.
            </span>
          </motion.h1>

          <motion.p {...rise(0.16)} className="mt-7 text-lg leading-relaxed text-navy-600">
            HomeBridge connects local foster homes with neighbors who want to help. See exactly what a home needs,
            send it straight from their wish list, or give an afternoon of your time.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/homes">Browse homes</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/volunteer">Volunteer your time</Link>
            </Button>
          </motion.div>

          <motion.p {...rise(0.32)} className="mt-10 text-sm text-navy-500">
            Every home is verified · Shown by city, never by address
          </motion.p>
        </div>

        {/* A live look at what homes need, straight from the data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          className="w-full rounded-[2rem] bg-navy-800 p-7 text-cream shadow-lift sm:p-9"
        >
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-sm text-navy-300">Open needs right now</p>
              <p className="mt-1 text-6xl font-bold tracking-tightest">{open.length}</p>
            </div>
            <p className="pb-2 text-right text-sm text-navy-300">
              across {homes.length}
              <br />
              local homes
            </p>
          </div>

          <ul className="divide-y divide-white/10">
            {list.map(({ home, need }, i) => (
              <motion.li
                key={`${home.id}-${need.id}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.45 + i * 0.08 }}
              >
                <Link
                  href={`/homes/${home.id}`}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-cream group-hover:text-amber-300">{need.title}</p>
                    <p className="truncate text-sm text-navy-300">
                      {home.name}, {home.area}
                    </p>
                  </div>
                  {need.urgent ? (
                    <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-navy-900">
                      Urgent
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm text-navy-400 transition-transform group-hover:translate-x-1 group-hover:text-cream">
                      →
                    </span>
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>

          <Link href="/homes" className="mt-2 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300">
            See every need →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
