import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AircraftFamily, COMPARISONS, Variant, comparisonSlug, fmt, getAircraft } from "@/lib/aircraft";
import { sortedEntries } from "@/lib/log";
import { altText } from "@/lib/photos";
import { breadcrumbJsonLd, SITE } from "@/lib/seo";
import { familyOf } from "@/lib/spotdle";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map(([a, b]) => ({ pair: comparisonSlug(a, b) }));
}

const resolve = (pair: string) => {
  const hit = COMPARISONS.find(([a, b]) => comparisonSlug(a, b) === pair);
  return hit ? ([getAircraft(hit[0])!, getAircraft(hit[1])!] as const) : null;
};

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const r = resolve(pair);
  if (!r) return {};
  const [a, b] = r;
  return {
    title: `${a.name} vs ${b.name}: verschillen en zo herken je ze`,
    description: `${a.name} of ${b.name}? Afmetingen, bereik en capaciteit naast elkaar, plus de kenmerken waaraan je ze op Schiphol uit elkaar houdt.`,
    alternates: { canonical: `/vergelijk/${pair}` },
  };
}

const ROWS: [string, (v: Variant, f: AircraftFamily) => string][] = [
  ["Variant", (v) => v.name],
  ["Lengte", (v) => fmt.m(v.length)],
  ["Spanwijdte", (v) => fmt.m(v.span)],
  ["Hoogte", (v) => fmt.m(v.height)],
  ["Max. startgewicht", (v) => fmt.t(v.mtow)],
  ["Bereik", (v) => fmt.km(v.range)],
  ["Stoelen of lading", (v) => v.seats ?? (v.payload ? `${v.payload} t` : "–")],
  ["Motoren", (_, f) => String(f.engines)],
  ["Eerste vlucht", (_, f) => String(f.firstFlight)],
];

export default async function ComparePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const r = resolve(pair);
  if (!r) notFound();
  const [a, b] = r;
  const va = a.variants[a.main];
  const vb = b.variants[b.main];
  const all = sortedEntries();
  const cover = (f: AircraftFamily) => all.find((e) => familyOf(e.type) === f.family);
  const longer = va.length > vb.length ? a : b;
  const wider = va.span > vb.span ? a : b;
  const further = va.range > vb.range ? a : b;

  const pairOf = (n: (v: Variant) => number, f: (x: number) => string) =>
    `${f(Math.max(n(va), n(vb)))} tegen ${f(Math.min(n(va), n(vb)))}`;
  const name = (f: AircraftFamily) => (f === a ? va.name : vb.name);
  const summary =
    longer === wider && wider === further
      ? `De ${name(longer)} is op alle punten groter: langer (${pairOf((v) => v.length, fmt.m)}), met een grotere spanwijdte (${pairOf((v) => v.span, fmt.m)}) en een groter bereik (${pairOf((v) => v.range, fmt.km)}).`
      : `De ${name(longer)} is de langste van de twee (${pairOf((v) => v.length, fmt.m)}), de ${name(wider)} heeft de grootste spanwijdte (${pairOf((v) => v.span, fmt.m)}) en de ${name(further)} vliegt het verst (${pairOf((v) => v.range, fmt.km)}).`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${a.name} vs ${b.name}`,
        about: [a.name, b.name].map((n) => ({ "@type": "Product", name: n })),
        author: { "@id": `${SITE.url}/#fotograaf` },
        description: summary,
      },
      breadcrumbJsonLd([
        { name: "Vliegtuigen", path: "/vliegtuig" },
        { name: `${a.name} vs ${b.name}`, path: `/vergelijk/${pair}` },
      ]),
    ],
  };

  return (
    <article className="mx-auto max-w-[1240px] px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm text-ink/60">
        <Link href="/vliegtuig">Vliegtuigen</Link> / Vergelijken
      </p>
      <h1 className="mt-1 text-2xl">
        {a.name} <span className="text-ink/40">vs</span> {b.name}
      </h1>
      <p className="mt-4 max-w-[68ch] text-lg">{summary}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {[a, b].map((f) => {
          const c = cover(f);
          return (
            <Link key={f.slug} href={`/vliegtuig/${f.slug}`} className="block text-ink no-underline">
              <div className="relative aspect-[3/2] bg-paper-2">
                {c && <Image src={c.image.src} alt={altText(c)} fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover" />}
              </div>
              <p className="mt-2 font-semibold">{f.name}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <caption className="sr-only">Specificaties van de {a.name} en de {b.name} naast elkaar</caption>
          <thead>
            <tr className="border-y border-rule text-left">
              <th scope="col" className="py-2 pr-4 font-semibold"><span className="sr-only">Eigenschap</span></th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{a.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, f]) => (
              <tr key={label} className="border-b border-rule/60">
                <th scope="row" className="py-2 pr-4 text-left font-normal text-ink/70">{label}</th>
                <td className="data py-2 pr-4 text-right">{f(va, a)}</td>
                <td className="data py-2 text-right">{f(vb, b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink/60">Afgeronde fabrieksopgaven; vergeleken zijn de {va.name} en de {vb.name}.</p>
      </div>

      <section className="mt-10 grid gap-10 md:grid-cols-2" aria-label="Zo houd je ze uit elkaar">
        {[a, b].map((f) => (
          <div key={f.slug}>
            <h2 className="text-xl">Zo herken je de {f.name}</h2>
            <ul className="mt-4 space-y-3">
              {f.spotting.map((s) => (
                <li key={s} className="border-l-2 border-plate pl-3">{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </article>
  );
}
