"use client";

import { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";

const noSubscribe = () => () => {};

/** QR code pointing at the home's public page, using whatever origin the site is served from. */
export function FlyerQR({ path, size = 200 }: { path: string; size?: number }) {
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => null
  );
  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const url = base ? new URL(path, base).toString() : null;

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl bg-white p-3 ring-1 ring-cream-200" style={{ width: size + 24, height: size + 24 }}>
        {url && <QRCodeSVG value={url} size={size} fgColor="#1B2A4A" level="M" marginSize={0} />}
      </div>
      {url && <p className="mt-2 max-w-[260px] break-all text-center text-[0.65rem] text-navy-400">{url}</p>}
    </div>
  );
}

export function PrintButton() {
  return (
    <Button variant="accent" onClick={() => window.print()}>
      Print flyer
    </Button>
  );
}
