import type { MetadataRoute } from "next";

// HomeBridge is unlisted for now: keep every crawler out.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
