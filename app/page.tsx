import Link from "next/link";
import LogExplorer from "@/components/LogExplorer";
import SplitFlapBoard from "@/components/SplitFlapBoard";
import { CATEGORIES, RUNWAYS, displayId } from "@/lib/photos";
import { operators, publishedEntries, sortedEntries, stats } from "@/lib/log";
import { SITE } from "@/lib/seo";

export const metadata = {
  title: "Dutchplanes, logboek van vliegtuigen op Schiphol",
  description:
    "Elke foto met registratie, type, maatschappij en camera-instellingen. Gespot op Schiphol, per spotdag doorzoekbaar, met een zoeker om door het hele log te bladeren.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const entries = sortedEntries();
  const published = publishedEntries();
  const s = stats();
  const topOperators = operators().slice(0, 8);

  // ItemList vertelt zoekmachines en assistenten dat dit een geordende
  // verzameling is, niet losse plaatjes. Alleen complete entries: een ItemList
  // vullen met half ingevulde regels maakt de structured data onbetrouwbaar.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Logboek Dutchplanes",
    numberOfItems: published.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: published.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${displayId(e)} ${e.type}`,
      url: `${SITE.url}/log/${e.id}`,
    })),
  };

  const board = entries
    .filter((e) => e.spottedAt)
    .slice(0, 24)
    .map((e) => ({
      id: e.id,
      time: e.spottedAt!.slice(11, 16),
      date: e.spottedAt!.slice(0, 10),
      reg: e.registration,
      type: e.typeShort,
      operator: e.operator ?? "",
      kind: CATEGORIES[e.category],
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <h1 className="sr-only">Dutchplanes, logboek van vliegtuigen gespot op Schiphol</h1>

      <SplitFlapBoard rows={board} />

      <section aria-label="Het log in cijfers" className="border-b border-rule bg-paper-2">
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Toestellen" value={s.total} />
          <Stat label="Spotdagen" value={s.days} href="/dag" />
          <Stat label="Maatschappijen" value={s.operators} href="/maatschappij" />
          <Stat label="Types" value={s.types} />
          <Stat label="Registraties" value={s.registrations} />
          <Stat
            label="Langste lens"
            value={s.longestLens?.camera ? `${s.longestLens.camera.focalMm} mm` : "–"}
            href={s.longestLens ? `/log/${s.longestLens.id}` : undefined}
          />
        </dl>
      </section>

      <section className="bg-plate">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
          <p>
            <span className="font-semibold">Spotdle</span>
            <span className="ml-2 text-ink/80">Elke dag één toestel, ver ingezoomd. Raad jij het type?</span>
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/spotdle" className="bg-ink px-3 py-1.5 text-paper no-underline hover:bg-approach">
              Speel vandaag
            </Link>
            <Link href="/mijn-spotlog" className="px-1 py-1.5 text-ink">
              Mijn spotlog
            </Link>
          </div>
        </div>
      </section>

      <LogExplorer entries={entries} />

      <section className="mx-auto grid max-w-[1240px] gap-10 border-t border-rule px-5 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-xl">Meest gespot</h2>
          <ol className="mt-4 text-sm">
            {topOperators.map((o, i) => (
              <li key={o.slug} className="flex justify-between gap-4 border-b border-rule py-2">
                <Link href={`/maatschappij/${o.slug}`} className="text-ink no-underline hover:underline">
                  <span className="data mr-3 text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                  {o.name}
                </Link>
                <span className="data">{o.entries.length}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm">
            <Link href="/maatschappij">Alle maatschappijen</Link>
          </p>
        </div>

        <div>
          <h2 className="text-xl">Bijzonder</h2>
          <p className="mt-2 max-w-[46ch] text-sm">
            De BelugaXL, een F-35, een tanker van de NAVO, speciale kleurstellingen
            van KLM, Transavia en Garuda. Alles wat je niet elke dag voorbij ziet
            komen.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/bijzonder">Bekijk de collectie</Link>
          </p>
        </div>

        <div>
          <h2 className="text-xl">In cijfers</h2>
          <p className="mt-2 max-w-[46ch] text-sm">
            Op welk uur er het meest gespot wordt, welke maatschappij het vaakst
            voorbijkomt, en de records: de langste lens, de kortste sluitertijd
            en de donkerste foto.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/statistieken">Naar de statistieken</Link>
          </p>
        </div>
      </section>

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
              <p className="mt-1 max-w-[50ch] text-sm text-ink/70">{RUNWAYS[code].description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  return (
    <div>
      <dt className="text-ink/60">{label}</dt>
      <dd className="data text-lg text-ink">
        {href ? (
          <Link href={href} className="text-ink no-underline hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
