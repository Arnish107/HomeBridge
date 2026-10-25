import Link from "next/link";
import { Logo } from "./logo";

const COLS = [
  {
    title: "Give",
    links: [
      { href: "/homes", label: "Browse homes" },
      { href: "/volunteer", label: "Volunteer" },
      { href: "/near-me", label: "Find near me" },
      { href: "/volunteer/hours", label: "Service hours log" },
    ],
  },
  {
    title: "Foster homes",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Register your home" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-navy-900 text-navy-200 print:hidden">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-navy-300">
            HomeBridge connects foster homes with neighbors who want to help, one coat, one notebook, one Tuesday
            afternoon at a time.
          </p>
          <p className="mt-6 text-xs text-navy-400">
            Locations are shown by city or county only. All contact goes through HomeBridge to protect the children
            in care.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-200 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="container flex flex-col gap-2 py-6 text-xs text-navy-400 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} HomeBridge. Built for the Congressional App Challenge.</span>
          <span>Made in Georgia.</span>
        </div>
      </div>
    </footer>
  );
}
