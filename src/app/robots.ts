import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swifttray.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/portal areas out of search engines
        disallow: ["/admin", "/vendor", "/api/", "/dashboard", "/student", "/checkout", "/orders"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
