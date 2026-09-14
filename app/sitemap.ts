import type { MetadataRoute } from "next";
import { publishedEntries, allTypeSlugs, RUNWAYS } from "@/lib/photos";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Alleen complete entries. Een half ingevulde pagina in je sitemap zetten
  // kost crawlbudget en levert niets op.
  const entries = publishedEntries();
  const nieuwste = entries[0]?.spottedAt ?? new Date().toISOString();

  return [
    {
      url: SITE.url,
      lastModified: nieuwste,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/over`,
      lastModified: nieuwste,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    // Entrypagina's. De datum van de foto is de lastModified, want de inhoud
    // van zo'n pagina verandert daarna niet meer.
    ...entries.map((e) => ({
      url: `${SITE.url}/log/${e.id}`,
      lastModified: e.spottedAt!,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    // Baanpagina's zijn de belangrijkste SEO-ingang: hierop wordt gezocht.
    ...Object.keys(RUNWAYS).map((code) => ({
      url: `${SITE.url}/baan/${code.toLowerCase()}`,
      lastModified: nieuwste,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...allTypeSlugs().map((s) => ({
      url: `${SITE.url}/type/${s}`,
      lastModified: nieuwste,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
