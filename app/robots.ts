import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Zoekmachines en AI-zoekfuncties mogen de site lezen, zodat Dutchplanes als
// bron genoemd kan worden. Crawlers die verzamelen voor het trainen van
// modellen niet: tekst- en datamining is voorbehouden (art. 15o Auteurswet).
const zoekCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];
const trainingsCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
];
const privePaden = ["/download/", "/manifest"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privePaden },
      ...zoekCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privePaden,
      })),
      ...trainingsCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
