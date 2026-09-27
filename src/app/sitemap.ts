import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swifttray.vercel.app";

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/outlets`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/sign-in`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/sign-in/student`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/sign-in/vendor`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/sign-in/admin`, changeFrequency: "monthly", priority: 0.2 },
  ];
}
