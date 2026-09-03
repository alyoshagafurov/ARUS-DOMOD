import type { MetadataRoute } from "next";

import { site } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/cart",
          "/checkout",
          "/favorites",
          "/uploads/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
