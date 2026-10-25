"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";

const LINKS = [
  { href: "/homes", label: "Homes" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/near-me", label: "Near me" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The mobile menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const { user, isAdmin } = useAuth();
  const account = user
    ? { href: isAdmin ? "/admin" : "/dashboard", label: isAdmin ? "Admin" : "Dashboard" }
    : { href: "/login", label: "Log in" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300 print:hidden",
        scrolled || open ? "border-navy-900/10 bg-cream/90 backdrop-blur-md" : "border-transparent bg-cream"
      )}
    >
      <nav className="container flex h-[68px] items-center justify-between gap-6">
        <Logo />

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="group relative py-2 text-[0.95rem] text-navy-700 transition-colors hover:text-navy-900 aria-[current=page]:text-navy-900"
              >
                {l.label}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-amber-500 transition-transform duration-300",
                    isActive(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <Link href={account.href} className="text-[0.95rem] text-navy-700 transition-colors hover:text-navy-900">
            {account.label}
          </Link>
          <Link
            href="/homes"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-[0.9rem] font-medium text-cream transition-colors hover:bg-navy-800"
          >
            Give help
          </Link>
        </div>

        <button
          className="font-mono text-xs uppercase tracking-[0.12em] text-navy-900 md:hidden"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-[68px] overflow-y-auto overscroll-contain bg-cream md:hidden"
          >
            <ul className="container border-t border-navy-900/10 pt-4">
              {[...LINKS, { href: "/volunteer/hours", label: "Hours log" }, account].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-navy-900/10"
                >
                  <Link href={l.href} className="block py-4 font-serif text-[2.6rem] leading-none text-navy-900">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container py-8">
              <Link
                href="/homes"
                className="block rounded-full bg-navy-900 py-4 text-center font-medium text-cream"
              >
                Give help
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
