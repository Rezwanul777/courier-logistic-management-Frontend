
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL;

  if (!siteUrl || process.env.VERCEL_ENV === "preview") {
    return [];
  }

  const pages = [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      path: "/services",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      path: "/pricing",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      path: "/about",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/contact",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ] as const;

  return pages.map((page) => ({
    url: new URL(page.path, siteUrl).toString(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}


