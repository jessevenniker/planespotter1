import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import { capitalize, formatDate, formatDayLong, dayKey } from "@/lib/photos";
import { getOperator, operators } from "@/lib/log";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return operators().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = getOperator(slug);
  if (!o) return {};
  const types = [...new Set(o.entries.map((e) => e.type))];
  return {
    title: `${o.name} gespot op Schiphol`,
    description: `${o.entries.length} foto's van ${o.name} op Schiphol: ${types.slice(0, 5).join(", ")}. Met registratie, datum en camera-instellingen.`,
    alternates: { canonical: `/maatschappij/${o.slug}` },
  };
}

export default async function OperatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = getOperator(slug);
  if (!o) notFound();

  // Welke types, hoe vaak, meest gespot eerst.
  const types = [...o.entries.reduce((m, e) => m.set(e.type, (m.get(e.type) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]);
  const regs = o.entries.filter((e) => e.registration).map((e) => e.registration!);
  const dated = o.entries.filter((e) => e.spottedAt);
  const first = dated[dated.length - 1];
  const last = dated[0];
  const spotDays = new Set(dated.map((e) => dayKey(e))).size;
  const all = operators();
  const rank = all.findIndex((x) => x.slug === o.slug) + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Log", path: "/" },
              { name: "Maatschappijen", path: "/maatschappij" },
              { name: o.name, path: `/maatschappij/${o.slug}` },
            ])
          ),
        }}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10">
        <p className="text-sm text-ink/60">
          <Link href="/maatschappij">Maatschappijen</Link>
        </p>
        <h1 className="mt-1 text-2xl">{o.name}</h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-rule py-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-ink/60">Gespot</dt>
            <dd className="data text-lg">{o.entries.length}×</dd>
          </div>
          <div>
            <dt className="text-ink/60">Plek in het log</dt>
            <dd className="data text-lg">
              #{rank} van {all.length}
            </dd>
          </div>
          <div>
            <dt className="text-ink/60">Spotdagen</dt>
            <dd className="data text-lg">{spotDays}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Eerst en laatst</dt>
            <dd className="data text-lg">
              {first ? `${formatDate(first.spottedAt)?.slice(0, 7)} – ${formatDate(last.spottedAt)?.slice(0, 7)}` : "–"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-lg">Types</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {types.map(([t, n]) => (
                <li key={t} className="data border border-rule px-2 py-1">
                  {t} <span className="text-ink/60">×{n}</span>
                </li>
              ))}
            </ul>
          </div>
          {regs.length > 0 && (
            <div>
              <h2 className="text-lg">Registraties</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {regs.map((r) => (
                  <li key={r}>
                    <span className="reg">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {last && (
          <p className="mt-6 text-sm text-ink/70">
            Laatst gespot op{" "}
            <Link href={`/dag/${dayKey(last)}`}>{capitalize(formatDayLong(dayKey(last)!))}</Link>.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-10">
        <h2 className="sr-only">Alle foto&apos;s van {o.name}</h2>
        <PhotoGrid entries={o.entries} />
      </section>
    </>
  );
}
