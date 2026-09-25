import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import { CATEGORIES, capitalize, formatDayLong, formatTime, lightOf } from "@/lib/photos";
import { days, getDay } from "@/lib/log";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return days().map((d) => ({ datum: d.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ datum: string }> }) {
  const { datum } = await params;
  const d = getDay(datum);
  if (!d) return {};
  const ops = [...new Set(d.entries.map((e) => e.operator).filter(Boolean))];
  return {
    title: `Spotdag ${formatDayLong(d.key)} op Schiphol`,
    description: `${d.entries.length} toestellen gespot op Schiphol op ${formatDayLong(d.key)}, waaronder ${ops.slice(0, 4).join(", ")}.`,
    alternates: { canonical: `/dag/${d.key}` },
  };
}

export default async function DayPage({ params }: { params: Promise<{ datum: string }> }) {
  const { datum } = await params;
  const d = getDay(datum);
  if (!d) notFound();

  const all = days();
  const i = all.findIndex((x) => x.key === d.key);
  const newer = all[i - 1];
  const older = all[i + 1];
  const first = d.entries[0];
  const last = d.entries[d.entries.length - 1];
  const ops = [...new Set(d.entries.map((e) => e.operator).filter(Boolean))] as string[];
  const lenses = [...new Set(d.entries.map((e) => e.camera?.focalMm).filter(Boolean))] as number[];
  const cats = [...new Set(d.entries.map((e) => CATEGORIES[e.category]))];
  const light = [...new Set(d.entries.map((e) => lightOf(e.sunAltitude)?.label).filter(Boolean))];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Log", path: "/" },
              { name: "Spotdagen", path: "/dag" },
              { name: capitalize(formatDayLong(d.key)), path: `/dag/${d.key}` },
            ])
          ),
        }}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10">
        <p className="text-sm text-ink/60">
          <Link href="/dag">Spotdagen</Link>
        </p>
        <h1 className="mt-1 text-2xl">{capitalize(formatDayLong(d.key))}</h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-rule py-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-ink/60">Toestellen</dt>
            <dd className="data text-lg">{d.entries.length}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Eerste en laatste</dt>
            <dd className="data text-lg">
              {formatTime(first.spottedAt)}–{formatTime(last.spottedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-ink/60">Maatschappijen</dt>
            <dd className="data text-lg">{ops.length}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Brandpunt</dt>
            <dd className="data text-lg">
              {lenses.length ? `${Math.min(...lenses)}–${Math.max(...lenses)} mm` : "–"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 max-w-[70ch] text-sm text-ink/70">
          {ops.length > 0 && <>Gezien: {ops.join(", ")}. </>}
          {cats.join(", ")}. {light.length > 0 && <>Licht: {light.join(", ").toLowerCase()}.</>}
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-10">
        <h2 className="sr-only">Alle toestellen van deze dag, in volgorde van spotten</h2>
        <PhotoGrid entries={d.entries} />
      </section>

      <nav aria-label="Andere spotdagen" className="mx-auto grid max-w-[1240px] grid-cols-2 gap-4 border-t border-rule px-5 py-6 text-sm">
        <div>
          {newer && (
            <Link href={`/dag/${newer.key}`}>
              ← {capitalize(formatDayLong(newer.key))} <span className="data">({newer.entries.length})</span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {older && (
            <Link href={`/dag/${older.key}`}>
              {capitalize(formatDayLong(older.key))} <span className="data">({older.entries.length})</span> →
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
