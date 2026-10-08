
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL;
  const isPreview = process.env.VERCEL_ENV === "preview";

  if (!siteUrl || isPreview) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account",
        "/admin/",
        "/dashboard/",
        "/courier/",
        "/provider/",
        "/payment/",
        "/login",
        "/register",
        "/verify-email",
      ],
    },
    sitemap: `${new URL(siteUrl).origin}/sitemap.xml`,
  };
}
