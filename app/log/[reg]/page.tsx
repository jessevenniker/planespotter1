import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  entries,
  getEntry,
  altText,
  formatDate,
  formatTime,
  displayId,
  availableSizes,
  RUNWAYS,
  DOWNLOAD_PRICE_EUR,
} from "@/lib/photos";
import { entryJsonLd, breadcrumbJsonLd, entryMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ reg: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reg: string }>;
}) {
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
      images: [
        {
          url: e.image.src,
          width: e.image.width,
          height: e.image.height,
          alt: altText(e),
        },
      ],
    },
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ reg: string }>;
}) {
  const { reg } = await params;
  const e = getEntry(reg);
  if (!e) notFound();

  const sizes = availableSizes(e);
  const crumbs = breadcrumbJsonLd(
    [
      { name: "Log", path: "/" },
      ...(e.runway
        ? [{ name: `Baan ${e.runway}`, path: `/baan/${e.runway.toLowerCase()}` }]
        : []),
      { name: displayId(e), path: `/log/${reg}` },
    ]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entryJsonLd(e)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />

      <nav
        aria-label="Kruimelpad"
        className="mx-auto max-w-[1240px] px-5 pt-5 text-sm"
      >
        <ol className="flex flex-wrap gap-2 text-ink/60">
          <li>
            <Link href="/">Log</Link>
          </li>
          {e.runway && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/baan/${e.runway.toLowerCase()}`}>
                  Baan <span className="data">{e.runway}</span>
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="data text-ink">{displayId(e)}</li>
        </ol>
      </nav>

      <article className="mx-auto grid max-w-[1240px] gap-8 px-5 py-8 md:grid-cols-[1.6fr_1fr] md:items-start">
        <div className="relative aspect-[3/2] bg-paper-2">
          <Image
            src={e.image.src}
            alt={altText(e)}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 740px"
            className="object-cover"
          />
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
            <Row label="Maatschappij" value={e.operator} />
            <Row
              label="Baan"
              value={e.runway && `${e.runway} ${RUNWAYS[e.runway].name}`}
              mono
            />
            <Row label="Locatie" value={e.location} />
            <Row label="Datum" value={formatDate(e.spottedAt)} mono />
            <Row label="Tijd" value={formatTime(e.spottedAt)} mono />
          </dl>

          {e.note && <p className="mt-5 max-w-[46ch] text-sm">{e.note}</p>}

          {e.forSale && sizes.length > 0 && (
            <>
              <h2 className="mt-10 text-lg">Print</h2>
              <ul className="mt-3 border-t border-rule text-sm">
                {sizes.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 border-b border-rule py-2.5"
                  >
                    <span className="data">{s.label}</span>
                    <span className="flex items-center gap-4">
                      <span className="data">€{s.priceEur}</span>
                      <button
                        type="button"
                        className="border border-ink px-3 py-1 hover:bg-plate"
                      >
                        Toevoegen
                      </button>
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-lg">Digitale download</h2>
              <div className="mt-3 flex items-center justify-between gap-4 border-y border-rule py-2.5 text-sm">
                <span className="data">
                  {e.image.fullWidth} × {e.image.fullHeight} px,{" "}
                  {e.image.fileSizeMb} MB
                </span>
                <span className="flex items-center gap-4">
                  <span className="data">€{DOWNLOAD_PRICE_EUR}</span>
                  <button
                    type="button"
                    className="border border-ink px-3 py-1 hover:bg-plate"
                  >
                    Toevoegen
                  </button>
                </span>
              </div>
              <p className="mt-2 max-w-[46ch] text-xs text-ink/60">
                JPEG op volledige resolutie, zonder watermerk. Direct te
                downloaden na betaling, de link blijft 48 uur geldig.
              </p>
            </>
          )}
        </div>
      </article>

      {e.runway && (
        <section className="mx-auto max-w-[1240px] border-t border-rule px-5 py-8">
          <h2 className="text-lg">Meer bij de {RUNWAYS[e.runway].name}</h2>
          <p className="mt-2 text-sm">
            <Link href={`/baan/${e.runway.toLowerCase()}`}>
              Bekijk alle entries op baan{" "}
              <span className="data">{e.runway}</span>
            </Link>
            {" · "}
            <Link href={`/type/${e.typeSlug}`}>
              Alle {e.typeShort} in het log
            </Link>
          </p>
        </section>
      )}
    </>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-rule py-2">
      <dt className="text-ink/60">{label}</dt>
      <dd className={mono ? "data text-right" : "text-right"}>{value}</dd>
    </div>
  );
}
