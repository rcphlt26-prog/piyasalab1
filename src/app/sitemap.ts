import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://piyasalab.com.tr",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
