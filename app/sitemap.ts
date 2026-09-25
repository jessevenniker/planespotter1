import type { MetadataRoute } from "next";
import { RUNWAYS } from "@/lib/photos";
import { allTypeSlugs, days, operators, publishedEntries, sortedEntries } from "@/lib/log";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Losse entrypagina's alleen als ze compleet zijn. Een half ingevulde pagina
  // in je sitemap zetten kost crawlbudget en levert niets op.
  const entries = publishedEntries();
  const nieuwste = sortedEntries()[0]?.spottedAt ?? new Date().toISOString();

  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "weekly") => ({
    url: `${SITE.url}${path}`,
    lastModified: nieuwste,
    changeFrequency,
    priority,
  });

  return [
    page("", 1),
    page("/dag", 0.8),
    page("/maatschappij", 0.8),
    page("/statistieken", 0.6),
    page("/bijzonder", 0.7),
    page("/over", 0.4, "yearly"),
    {
      url: `${SITE.url}/privacy-en-auteursrecht`,
      lastModified: "2026-09-25",
      changeFrequency: "yearly",
      priority: 0.2,
    },
    // Spotdagen en maatschappijen: verzamelpagina's met echte inhoud, dus
    // wel in de sitemap, ook al zijn de losse entries nog niet compleet.
    ...days().map((d) => ({
      url: `${SITE.url}/dag/${d.key}`,
      lastModified: d.entries[d.entries.length - 1].spottedAt!,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...operators().map((o) => page(`/maatschappij/${o.slug}`, 0.7)),
    ...entries.map((e) => ({
      url: `${SITE.url}/log/${e.id}`,
      lastModified: e.spottedAt!,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    // Baanpagina's zijn de belangrijkste SEO-ingang: hierop wordt gezocht.
    ...Object.keys(RUNWAYS).map((code) => page(`/baan/${code.toLowerCase()}`, 0.9)),
    ...allTypeSlugs().map((s) => page(`/type/${s}`, 0.7)),
  ];
}
