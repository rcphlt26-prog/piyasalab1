import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portfoy", "/ayarlar", "/admin", "/api/", "/auth/"],
    },
    sitemap: "https://veriakis.com/sitemap.xml",
  };
}
