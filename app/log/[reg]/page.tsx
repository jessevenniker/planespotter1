import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryControls from "@/components/EntryControls";
import PhotoGrid from "@/components/PhotoGrid";
import SeenToggle from "@/components/SeenToggle";
import ShareButtons from "@/components/ShareButtons";
import {
  CATEGORIES,
  DOWNLOAD_PRICE_EUR,
  RUNWAYS,
  altText,
  availableSizes,
  capitalize,
  dayKey,
  displayId,
  formatDate,
  formatDayLong,
  formatTime,
  lightOf,
  operatorSlug,
  specialReason,
} from "@/lib/photos";
import { entries, getDay, getEntry, getOperator, neighbours } from "@/lib/log";
import { entryJsonLd, breadcrumbJsonLd, entryMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ reg: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ reg: string }> }) {
  const { reg } = await params;
  const e = getEntry(reg);
  if (!e) return {};
  const meta = entryMeta(e);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/log/${reg}` },
    robots: meta.index ? undefined : { index: false, follow: true },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      // De afbeelding komt uit opengraph-image.tsx in deze map.
    },
  };
}

export default async function EntryPage({ params }: { params: Promise<{ reg: string }> }) {
  const { reg } = await params;
  const e = getEntry(reg);
  if (!e) notFound();

  const sizes = availableSizes(e);
  const nb = neighbours(e.id);
  const day = dayKey(e) ? getDay(dayKey(e)!) : undefined;
  const sameDay = day?.entries.filter((x) => x.id !== e.id) ?? [];
  const op = operatorSlug(e) ? getOperator(operatorSlug(e)!) : undefined;
  const sameOperator = op?.entries.filter((x) => x.id !== e.id).slice(0, 6) ?? [];
  const light = lightOf(e.sunAltitude);
  const reason = specialReason(e);
  const c = e.camera;

  const crumbs = breadcrumbJsonLd([
    { name: "Log", path: "/" },
    ...(day ? [{ name: capitalize(formatDayLong(day.key)), path: `/dag/${day.key}` }] : []),
    { name: displayId(e), path: `/log/${reg}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entryJsonLd(e)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <nav aria-label="Kruimelpad" className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 pt-5 text-sm">
        <ol className="flex flex-wrap gap-2 text-ink/60">
          <li>
            <Link href="/">Log</Link>
          </li>
          {day && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/dag/${day.key}`}>{capitalize(formatDayLong(day.key))}</Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="data text-ink">{displayId(e)}</li>
        </ol>
        <p className="data text-ink/60">
          {nb.position}/{nb.total}
        </p>
      </nav>

      <article className="mx-auto grid max-w-[1240px] gap-8 px-5 py-8 md:grid-cols-[1.6fr_1fr] md:items-start">
        <div>
          <div className="relative aspect-[3/2] bg-paper-2">
            <Image
              src={e.image.src}
              alt={altText(e)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 740px"
              className="object-cover"
            />
            {reason && (
              <span className="absolute left-3 top-3 bg-plate px-2 py-1 text-sm">★ {reason}</span>
            )}
          </div>

          {/* Belichtingsstrook, zoals onderin de zoeker van de camera. */}
          {c && (
            <div className="data flex flex-wrap items-center gap-x-6 gap-y-1 bg-ink px-4 py-2.5 text-sm text-paper">
              <span>{c.shutter}</span>
              <span>F{c.aperture}</span>
              {c.iso && <span>ISO {c.iso}</span>}
              <span>{c.focalMm}mm</span>
              {light && (
                <span className="ml-auto text-plate">
                  {light.label} · zon {e.sunAltitude}°
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          {e.registration ? (
            <>
              <h1 className="text-2xl">
                <span className="reg">{e.registration}</span>
              </h1>
              <p className="mt-3 text-lg">{e.type}</p>
            </>
          ) : (
            <h1 className="text-2xl">{e.type}</h1>
          )}

          <dl className="mt-5 border-t border-rule text-sm">
            <Row
              label="Maatschappij"
              value={e.operator}
              href={op ? `/maatschappij/${op.slug}` : undefined}
            />
            <Row label="Soort" value={CATEGORIES[e.category]} />
            <Row label="Baan" value={e.runway && `${e.runway} ${RUNWAYS[e.runway].name}`} mono />
            <Row label="Locatie" value={e.location} />
            <Row label="Datum" value={formatDate(e.spottedAt)} mono href={day ? `/dag/${day.key}` : undefined} />
            <Row label="Tijd" value={formatTime(e.spottedAt)} mono />
          </dl>

          {c && (
            <>
              <h2 className="mt-8 text-lg">Camera</h2>
              <dl className="mt-3 border-t border-rule text-sm">
                <Row label="Body" value={c.body} />
                <Row label="Objectief" value={c.lens} />
                <Row label="Brandpunt" value={`${c.focalMm} mm`} mono />
                <Row label="Sluitertijd" value={c.shutter} mono />
                <Row label="Diafragma" value={`f/${c.aperture}`} mono />
                <Row label="ISO" value={c.iso ? String(c.iso) : null} mono />
                <Row label="Origineel" value={`${e.image.fullWidth} × ${e.image.fullHeight} px`} mono />
              </dl>
            </>
          )}

          {e.note && <p className="mt-5 max-w-[46ch] text-sm">{e.note}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <EntryControls id={e.id} newerId={nb.newer?.id ?? null} olderId={nb.older?.id ?? null} />
            <SeenToggle id={e.id} />
            <ShareButtons id={e.id} title={`${e.registration ?? e.type}${e.operator ? `, ${e.operator}` : ""} op Dutchplanes`} />
          </div>

          {e.forSale && sizes.length > 0 && (
            <>
              <h2 className="mt-10 text-lg">Print</h2>
              <ul className="mt-3 border-t border-rule text-sm">
                {sizes.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 border-b border-rule py-2.5">
                    <span className="data">{s.label}</span>
                    <span className="flex items-center gap-4">
                      <span className="data">€{s.priceEur}</span>
                      <button type="button" className="border border-ink px-3 py-1 hover:bg-plate">
                        Toevoegen
                      </button>
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-lg">Digitale download</h2>
              <div className="mt-3 flex items-center justify-between gap-4 border-y border-rule py-2.5 text-sm">
                <span className="data">
                  {e.image.fullWidth} × {e.image.fullHeight} px, {e.image.fileSizeMb} MB
                </span>
                <span className="flex items-center gap-4">
                  <span className="data">€{DOWNLOAD_PRICE_EUR}</span>
                  <button type="button" className="border border-ink px-3 py-1 hover:bg-plate">
                    Toevoegen
                  </button>
                </span>
              </div>
            </>
          )}
        </div>
      </article>

      <nav aria-label="Door het log bladeren" className="mx-auto grid max-w-[1240px] grid-cols-2 gap-4 border-t border-rule px-5 py-6 text-sm">
        <div>
          {nb.newer && (
            <Link href={`/log/${nb.newer.id}`} className="group text-ink no-underline">
              <span className="text-ink/60">
                <span className="data">←</span> Nieuwer
              </span>
              <span className="mt-1 block font-semibold group-hover:underline">
                {nb.newer.registration ?? nb.newer.type}
              </span>
              <span className="block text-ink/70">{nb.newer.operator}</span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {nb.older && (
            <Link href={`/log/${nb.older.id}`} className="group text-ink no-underline">
              <span className="text-ink/60">
                Ouder <span className="data">→</span>
              </span>
              <span className="mt-1 block font-semibold group-hover:underline">
                {nb.older.registration ?? nb.older.type}
              </span>
              <span className="block text-ink/70">{nb.older.operator}</span>
            </Link>
          )}
        </div>
      </nav>

      {sameDay.length > 0 && day && (
        <section className="mx-auto max-w-[1240px] border-t border-rule px-5 py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg">Dezelfde dag gespot</h2>
            <Link href={`/dag/${day.key}`} className="text-sm">
              {capitalize(formatDayLong(day.key))}, <span className="data">{day.entries.length}</span> toestellen
            </Link>
          </div>
          <div className="mt-5">
            <PhotoGrid entries={sameDay.slice(0, 6)} />
          </div>
        </section>
      )}

      {sameOperator.length > 0 && op && (
        <section className="mx-auto max-w-[1240px] border-t border-rule px-5 py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg">Meer van {op.name}</h2>
            <Link href={`/maatschappij/${op.slug}`} className="text-sm">
              Alle <span className="data">{op.entries.length}</span> van {op.name}
            </Link>
          </div>
          <div className="mt-5">
            <PhotoGrid entries={sameOperator} />
          </div>
        </section>
      )}
    </>
  );
}

function Row({
  label,
  value,
  mono = false,
  href,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-rule py-2">
      <dt className="text-ink/60">{label}</dt>
      <dd className={mono ? "data text-right" : "text-right"}>
        {href ? <Link href={href}>{value}</Link> : value}
      </dd>
    </div>
  );
}
