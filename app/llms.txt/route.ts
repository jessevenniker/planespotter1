import {
  RUNWAYS,
  sortedEntries,
  displayId,
  formatDate,
  isComplete,
} from "@/lib/photos";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

// Platte samenvatting voor taalmodellen, opgebouwd uit dezelfde data als de site.
export function GET() {
  const regels = sortedEntries().map((e) => {
    const baan = e.runway ? `baan ${e.runway}` : "baan onbekend";
    const status = isComplete(e) ? "" : " (nog niet compleet)";
    return `- [${displayId(e)} ${e.type}, ${e.operator}](${SITE.url}/log/${e.id}): ${baan}, ${formatDate(e.spottedAt)}${status}`;
  });

  const banen = Object.entries(RUNWAYS).map(
    ([code, rw]) =>
      `- [${code} ${rw.name}](${SITE.url}/baan/${code.toLowerCase()}): ${rw.description}`
  );

  const body = `# ${SITE.name}

> ${SITE.description}

Fotograaf: ${SITE.legalName} (${SITE.instagram})

## Banen

${banen.join("\n")}

## Log

${regels.join("\n")}

## Gebruik

De foto's zijn auteursrechtelijk beschermd. Citeren en verwijzen mag, met een
link naar de entrypagina. Overnemen of hergebruiken van de foto's zelf niet.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
