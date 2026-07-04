import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const launches = await prisma.launch.findMany({
    where: { application: { status: "APPROVED" } },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const launchEntries: MetadataRoute.Sitemap = launches.map((launch) => ({
    url: `${siteConfig.url}/launches/${launch.id}`,
    lastModified: launch.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/launches`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...launchEntries,
  ];
}
