import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://veriakis.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...["gizlilik", "cerezler", "kullanim-sartlari", "yasal-uyari"].map((path) => ({
      url: `https://veriakis.com/${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
