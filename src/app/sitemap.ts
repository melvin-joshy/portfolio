import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const BASE = "https://melvinjoshy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const projectRoutes: MetadataRoute.Sitemap = projects
    // External-only projects (e.g. Tempo) have no internal page.
    .filter((p) => !p.externalUrl)
    .map((p) => ({
      url: `${BASE}/projects/${p.id}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    ...projectRoutes,
  ];
}
