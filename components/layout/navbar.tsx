"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";

const LINKS = [
  { href: "/homes", label: "Browse homes" },
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
    : { href: "/login", label: "Foster home login" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 print:hidden transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || open
          ? "border-b border-cream-200/80 bg-cream/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container flex h-[72px] items-center justify-between">
        <Logo />

        <ul className="hidden items-center gap-1 rounded-full border border-navy-800/[0.06] bg-white/60 p-1 backdrop-blur md:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="relative">
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-navy-800"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Link
                href={l.href}
                className={cn(
                  "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(l.href) ? "text-cream" : "text-navy-600 hover:text-navy-900"
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href={account.href}>{account.label}</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/homes">Give help</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-navy-800 hover:bg-navy-800/5 md:hidden"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="container flex flex-col gap-1 pb-6 pt-2">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.05 }}
                >
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-medium",
                      isActive(l.href) ? "bg-navy-800 text-cream" : "text-navy-700 hover:bg-navy-800/5"
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href={account.href}>{user ? account.label : "Login"}</Link>
                </Button>
                <Button asChild variant="accent">
                  <Link href="/homes">Give help</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
