import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/sa/", "/auth/"],
    },
    sitemap: "https://www.advancelytics.com/sitemap.xml",
  };
}
