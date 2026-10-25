import { cn } from "@/lib/utils";

// Cover tones stay inside the brand palette: navy, amber, and warm neutrals.
const TONES = [
  { bg: "#1B2A4A", fg: "#F59E0B", sub: "#97A6C2" },
  { bg: "#F1E4CC", fg: "#1B2A4A", sub: "#8A7356" },
  { bg: "#E3E7EE", fg: "#1B2A4A", sub: "#64799F" },
  { bg: "#F59E0B", fg: "#1B2A4A", sub: "#7A4A06" },
  { bg: "#263859", fg: "#F9F7F4", sub: "#97A6C2" },
  { bg: "#ECE7DF", fg: "#B45309", sub: "#8A7356" },
];

/** Stable tone per home so a home looks the same on every page. */
export function toneFor(key: string, tone?: number) {
  if (tone !== undefined && TONES[tone]) return TONES[tone];
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/**
 * Typographic cover for a home: a brand-colored block with the home's initials set large.
 * Used instead of photos, which we avoid for the children's privacy.
 */
export function HomeCover({
  name,
  area,
  tone,
  className,
}: {
  name: string;
  area: string;
  tone?: number;
  className?: string;
}) {
  const t = toneFor(name, tone);
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)} style={{ background: t.bg }} aria-hidden>
      <span
        className="absolute -bottom-[0.22em] -left-[0.04em] select-none font-bold leading-none tracking-tightest"
        style={{ color: t.fg, fontSize: "clamp(7rem, 15vw, 10.5rem)" }}
      >
        {initials(name)}
      </span>
      <span
        className="absolute right-4 top-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
        style={{ color: t.sub }}
      >
        {area}
      </span>
    </div>
  );
}
