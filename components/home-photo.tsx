import Image from "next/image";
import type { FosterHome } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HomeCover } from "./home-cover";

/** Unsplash serves resized, compressed images itself, so we skip Next's optimizer (and its quota). */
export const unsplash = (url: string, w: number) => `${url}?w=${w}&q=72&auto=format&fit=crop`;

/**
 * Cover image for a home. Uses the home's photo when it has one,
 * otherwise the typographic brand-color cover.
 */
export function HomePhoto({
  home,
  width = 800,
  priority = false,
  className,
}: {
  home: Pick<FosterHome, "name" | "area" | "tone" | "photo">;
  width?: number;
  priority?: boolean;
  className?: string;
}) {
  if (!home.photo) return <HomeCover name={home.name} area={home.area} tone={home.tone} className={className} />;

  return (
    <div className={cn("relative h-full w-full bg-cream-200", className)}>
      <Image
        src={unsplash(home.photo.url, width)}
        alt={home.photo.alt}
        fill
        unoptimized
        priority={priority}
        sizes={`${width}px`}
        className="object-cover"
      />
    </div>
  );
}

export function PhotoCredit({ home, className }: { home: Pick<FosterHome, "photo">; className?: string }) {
  if (!home.photo) return null;
  return (
    <p className={cn("text-xs text-navy-400", className)}>
      Photo by{" "}
      <a
        href={`${home.photo.creditUrl}?utm_source=homebridge&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-navy-700"
      >
        {home.photo.credit}
      </a>{" "}
      on{" "}
      <a
        href="https://unsplash.com/?utm_source=homebridge&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-navy-700"
      >
        Unsplash
      </a>
      . Illustrative only, not the actual home.
    </p>
  );
}
