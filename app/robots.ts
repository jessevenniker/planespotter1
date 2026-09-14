import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// AI-crawlers mogen alles behalve downloads en het manifest. CCBot niet: dat is
// scrapen zonder verwijzing terug.
const aiCrawlers = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"];
const privePaden = ["/download/", "/manifest"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privePaden },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privePaden,
      })),
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
