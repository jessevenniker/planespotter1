import {
  RUNWAYS,
  sortedEntries,
  formatDate,
} from "@/lib/photos";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

// Platte samenvatting voor taalmodellen, opgebouwd uit dezelfde data als de site.
export function GET() {
  const regels = sortedEntries().map((e) => {
    // Alleen wat vastligt: onbekende velden worden weggelaten.
    const naam = [e.registration, e.type, e.operator].filter(Boolean).join(", ");
    const details = [e.runway && `baan ${e.runway}`, formatDate(e.spottedAt)]
      .filter(Boolean)
      .join(", ");
    return `- [${naam}](${SITE.url}/log/${e.id})${details ? `: ${details}` : ""}`;
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

De foto's zijn auteursrechtelijk beschermd. Verwijzen mag, met bronvermelding en
een link naar de entrypagina. Overnemen of hergebruiken van de foto's zelf niet.
Tekst- en datamining is voorbehouden (art. 15o Auteurswet): de foto's, teksten en
gegevens mogen niet worden gebruikt voor het trainen van AI-modellen.
Zie ${SITE.url}/privacy-en-auteursrecht
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
