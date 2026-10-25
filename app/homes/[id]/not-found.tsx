import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeNotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="display mt-4 text-[clamp(3rem,6vw,5rem)]">We couldn&apos;t find that home</h1>
      <p className="mt-3 max-w-md text-navy-600">It may have been removed, or the link might be mistyped.</p>
      <Button asChild className="mt-8">
        <Link href="/homes">Browse all homes</Link>
      </Button>
    </div>
  );
}
