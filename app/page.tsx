import Link from "next/link";
import LogTable from "@/components/LogTable";
import {
  sortedEntries,
  publishedEntries,
  RUNWAYS,
  displayId,
} from "@/lib/photos";
import { SITE } from "@/lib/seo";

export const metadata = {
  title: "Dutchplanes, logboek van vliegtuigen op Schiphol",
  description:
    "Elke foto met registratie, type, maatschappij en baan. Gespot bij de Polderbaan, Kaagbaan en Buitenveldertbaan. Te koop als print en digitale download.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const entries = sortedEntries();
  const published = publishedEntries();

  // ItemList vertelt zoekmachines en assistenten dat dit een geordende
  // verzameling is, niet losse plaatjes. Dat is wat een antwoordmachine nodig
  // heeft om te zeggen "op deze site staan X gelogde toestellen".
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Logboek Dutchplanes",
    // Alleen complete entries: een ItemList vullen met half ingevulde regels
    // maakt de structured data onbetrouwbaar.
    numberOfItems: published.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: published.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${displayId(e)} ${e.type}`,
      url: `${SITE.url}/log/${e.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <LogTable entries={entries} />

      <section className="mx-auto max-w-[1240px] border-t border-rule px-5 py-10">
        <h2 className="text-xl">Banen</h2>
        <p className="mt-2 max-w-[60ch] text-sm">
          Schiphol heeft zes banen en welke in gebruik is hangt af van de wind.
          Per baan staat hier wat er gelogd is en waar je kunt staan.
        </p>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {Object.keys(RUNWAYS).map((code) => (
            <li key={code} className="border-t border-rule pt-3">
              <Link href={`/baan/${code.toLowerCase()}`} className="text-ink no-underline">
                <span className="data text-lg">{code}</span>{" "}
                <span className="font-semibold">{RUNWAYS[code].name}</span>
              </Link>
              <p className="mt-1 max-w-[50ch] text-sm text-ink/70">
                {RUNWAYS[code].description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
