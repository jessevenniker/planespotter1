import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import { AIRCRAFT, COMPARISONS, comparisonSlug, fmt, getAircraft } from "@/lib/aircraft";
import { sortedEntries } from "@/lib/log";
import { slugify } from "@/lib/photos";
import { breadcrumbJsonLd, SITE } from "@/lib/seo";
import { familyOf } from "@/lib/spotdle";

export const dynamicParams = false;

export function generateStaticParams() {
  return AIRCRAFT.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getAircraft(slug);
  if (!a) return {};
  const v = a.variants[a.main];
  return {
    title: `${a.name}${a.nickname ? ` (${a.nickname})` : ""}: specificaties, herkennen en spotten op Schiphol`,
    description: `Alles over de ${a.name}: lengte ${fmt.m(v.length)}, spanwijdte ${fmt.m(v.span)}, bereik ${fmt.km(v.range)}. Zo herken je hem en zo zie je hem op Schiphol, met foto's uit ons logboek.`,
    alternates: { canonical: `/vliegtuig/${a.slug}` },
  };
}

export default async function AircraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getAircraft(slug);
  if (!a) notFound();

  const logged = sortedEntries().filter((e) => familyOf(e.type) === a.family);
  const ops = [...logged.reduce((m, e) => (e.operator ? m.set(e.operator, (m.get(e.operator) ?? 0) + 1) : m), new Map<string, number>())]
    .sort((x, y) => y[1] - x[1]);
  const regs = logged.filter((e) => e.registration);
  const pairs = COMPARISONS.filter(([x, y]) => x === a.slug || y === a.slug);
  const main = a.variants[a.main];
  const cargo = a.variants.some((v) => v.payload);

  // Vragen die mensen echt stellen; de antwoorden komen uit dezelfde data.
  const faq: [string, string][] = [
    [
      `Hoe groot is de ${a.name}?`,
      a.variants.map((v) => `De ${v.name} is ${fmt.m(v.length)} lang met een spanwijdte van ${fmt.m(v.span)}.`).join(" "),
    ],
    [
      `Hoe ver kan de ${a.name} vliegen?`,
      a.variants.map((v) => `${v.name}: ongeveer ${fmt.km(v.range)}${v.payload ? ` met ${v.payload} ton vracht` : ""}.`).join(" "),
    ],
    ...(a.variants.some((v) => v.seats)
      ? [[`Hoeveel passagiers passen er in een ${a.name}?`, a.variants.filter((v) => v.seats).map((v) => `${v.name}: ${v.seats} stoelen, afhankelijk van de inrichting.`).join(" ")] as [string, string]]
      : []),
    [`Hoe herken je een ${a.name}?`, a.spotting.join(" ")],
    [
      `Welke maatschappijen vliegen met de ${a.name} op Schiphol?`,
      ops.length
        ? `In ons logboek staat de ${a.name} bij ${ops.map(([o, n]) => `${o} (${n}×)`).join(", ")}.`
        : `We hebben de ${a.name} nog niet gespot op Schiphol.`,
    ],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE.url}/vliegtuig/${a.slug}#type`,
        name: a.name,
        alternateName: a.nickname,
        category: `Verkeersvliegtuig met ${a.body}`,
        manufacturer: { "@type": "Organization", name: a.maker },
        description: a.intro,
        additionalProperty: [
          { "@type": "PropertyValue", name: "Eerste vlucht", value: a.firstFlight },
          { "@type": "PropertyValue", name: "In dienst sinds", value: a.inService },
          { "@type": "PropertyValue", name: "Aantal motoren", value: a.engines },
          { "@type": "PropertyValue", name: "Lengte", value: main.length, unitCode: "MTR" },
          { "@type": "PropertyValue", name: "Spanwijdte", value: main.span, unitCode: "MTR" },
          { "@type": "PropertyValue", name: "Maximaal startgewicht", value: main.mtow, unitCode: "TNE" },
          { "@type": "PropertyValue", name: "Bereik", value: main.range, unitCode: "KMT" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })),
      },
      breadcrumbJsonLd([
        { name: "Vliegtuigen", path: "/vliegtuig" },
        { name: a.name, path: `/vliegtuig/${a.slug}` },
      ]),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-[1240px] px-5 py-10">
        <p className="text-sm text-ink/60">
          <Link href="/vliegtuig">Vliegtuigen</Link> / {a.maker}
        </p>
        <h1 className="mt-1 text-2xl">
          {a.name}
          {a.nickname && <span className="text-ink/50"> · {a.nickname}</span>}
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-rule py-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Fabrikant", a.maker],
            ["Eerste vlucht", String(a.firstFlight)],
            ["In dienst", String(a.inService)],
            ["Motoren", String(a.engines)],
            ["Romp", a.body],
            ["In ons log", `${logged.length}×`],
          ].map(([l, v]) => (
            <div key={l}>
              <dt className="text-ink/60">{l}</dt>
              <dd className="data text-lg">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-[68ch] text-lg">{a.intro}</p>

        <section className="mt-10" aria-labelledby="specs">
          <h2 id="specs" className="text-xl">Specificaties</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">Afmetingen, gewicht, bereik en capaciteit per variant van de {a.name}</caption>
              <thead>
                <tr className="border-y border-rule text-left">
                  <th scope="col" className="py-2 pr-4 font-semibold">Variant</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Lengte</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Spanwijdte</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Hoogte</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Max. startgewicht</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Bereik</th>
                  <th scope="col" className="py-2 text-right font-semibold">{cargo ? "Stoelen of lading" : "Stoelen"}</th>
                </tr>
              </thead>
              <tbody>
                {a.variants.map((v) => (
                  <tr key={v.name} className="border-b border-rule/60">
                    <th scope="row" className="data py-2 pr-4 text-left font-normal">{v.name}</th>
                    <td className="data py-2 pr-4 text-right">{fmt.m(v.length)}</td>
                    <td className="data py-2 pr-4 text-right">{fmt.m(v.span)}</td>
                    <td className="data py-2 pr-4 text-right">{fmt.m(v.height)}</td>
                    <td className="data py-2 pr-4 text-right">{fmt.t(v.mtow)}</td>
                    <td className="data py-2 pr-4 text-right">{fmt.km(v.range)}</td>
                    <td className="data py-2 text-right">{v.seats ?? (v.payload ? `${v.payload} t` : "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink/60">
            Motoren: {a.engineTypes}. Afgeronde fabrieksopgaven van {a.maker}; exacte waarden verschillen per uitvoering.
          </p>
        </section>

        <section className="mt-10 grid gap-10 md:grid-cols-2" aria-labelledby="herkennen">
          <div>
            <h2 id="herkennen" className="text-xl">Zo herken je hem</h2>
            <ul className="mt-4 space-y-3">
              {a.spotting.map((s) => (
                <li key={s} className="border-l-2 border-plate pl-3">{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl">Op Schiphol</h2>
            {ops.length ? (
              <>
                <p className="mt-3 text-sm text-ink/70">
                  In ons logboek <span className="data">{logged.length}</span>× gespot
                  {regs.length > 0 && <>, met {regs.length} bekende registraties</>}.
                </p>
                <ul className="mt-3 text-sm">
                  {ops.map(([o, n]) => (
                    <li key={o} className="flex justify-between border-b border-rule py-1.5">
                      <Link href={`/maatschappij/${slugify(o)}`}>{o}</Link>
                      <span className="data">{n}×</span>
                    </li>
                  ))}
                </ul>
                {regs.length > 0 && (
                  <p className="mt-3 flex flex-wrap gap-2">
                    {regs.map((e) => (
                      <Link key={e.id} href={`/log/${e.id}`} className="reg text-sm no-underline">{e.registration}</Link>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-ink/70">Nog niet gespot. Houd de <Link href="/aankomsten">live aankomsten</Link> in de gaten.</p>
            )}
          </div>
        </section>

        {pairs.length > 0 && (
          <section className="mt-10" aria-labelledby="vergelijk">
            <h2 id="vergelijk" className="text-xl">Vergelijk</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {pairs.map(([x, y]) => (
                <li key={`${x}-${y}`}>
                  <Link href={`/vergelijk/${comparisonSlug(x, y)}`} className="inline-block border border-ink px-3 py-1.5 text-ink no-underline hover:bg-paper-2">
                    {getAircraft(x)!.name} vs {getAircraft(y)!.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10" aria-labelledby="faq">
          <h2 id="faq" className="text-xl">Vragen over de {a.name}</h2>
          <div className="mt-4 border-t border-rule">
            {faq.map(([q, ans]) => (
              <details key={q} className="border-b border-rule py-3">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2 max-w-[68ch] text-sm">{ans}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      {logged.length > 0 && (
        <section className="mx-auto max-w-[1240px] border-t border-rule px-5 py-10">
          <h2 className="text-xl">Gespot op Schiphol</h2>
          <div className="mt-6">
            <PhotoGrid entries={logged} />
          </div>
        </section>
      )}
    </>
  );
}
