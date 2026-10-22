import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { categories } from "@/tools/categories";
import { getToolsByCategory, tools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...tools.map((t) => ({
      url: `${site.url}/tools/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...categories
      .filter((c) => getToolsByCategory(c.slug).length > 0)
      .map((c) => ({
        url: `${site.url}/category/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  ];
}
