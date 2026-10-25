import Link from "next/link";
import { LogoMark } from "./logo";

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
    <footer className="mt-32 border-t border-navy-900/15 print:hidden">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-sm font-serif text-3xl leading-[1.1] text-navy-900">
            Helping foster homes in North Metro Atlanta, one coat, one notebook, one Tuesday afternoon at a time.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title} className="md:col-span-3 md:col-start-auto">
            <h2 className="eyebrow">{c.title}</h2>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.95rem] text-navy-700 underline decoration-transparent underline-offset-4 transition-colors hover:text-navy-900 hover:decoration-amber-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container">
        <div className="flex flex-col gap-3 border-t border-navy-900/15 py-6 text-sm text-navy-500 md:flex-row md:justify-between">
          <p>Homes are shown by city or county only. Every message goes through HomeBridge.</p>
          <p>Built for the Congressional App Challenge, Georgia.</p>
        </div>
      </div>

      {/* Closing wordmark: the page ends at the largest scale it has. */}
      <div aria-hidden className="overflow-hidden">
        <div className="container flex items-end gap-[2vw] pb-4">
          <LogoMark className="mb-[2.2vw] h-[6vw] min-h-8" />
          <span className="select-none font-serif text-[clamp(4rem,17.5vw,17rem)] leading-[0.78] tracking-[-0.035em] text-navy-900">
            HomeBridge
          </span>
        </div>
      </div>
    </footer>
  );
}
