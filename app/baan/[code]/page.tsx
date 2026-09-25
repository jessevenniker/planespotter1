import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RUNWAYS,
  entriesByRunway,
  altText,
  formatDate,
} from "@/lib/photos";
import { runwayJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  // Alle vier de banen krijgen een pagina, ook zonder entries. Deze pagina's
  // zijn de SEO-ingang en moeten bestaan voordat de foto's er zijn.
  return Object.keys(RUNWAYS).map((code) => ({ code: code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const upper = code.toUpperCase();
  const rw = RUNWAYS[upper];
  if (!rw) return {};

  // Titel richt zich op de zoekterm die mensen echt intypen: de baannaam,
  // niet de code.
  return {
    title: `Spotten bij de ${rw.name} (${upper}) op Schiphol`,
    description: `${rw.description} Alle vliegtuigen die hier gelogd zijn, met registratie, type en datum.`,
    alternates: { canonical: `/baan/${code}` },
  };
}

export default async function RunwayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const upper = code.toUpperCase();
  const rw = RUNWAYS[upper];
  if (!rw) notFound();

  const list = entriesByRunway(upper);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(runwayJsonLd(upper, list.length)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Log", path: "/" },
              { name: `Baan ${upper}`, path: `/baan/${code}` },
            ])
          ),
        }}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10">
        <p className="data text-sm text-ink/60">Baan {upper}</p>
        <h1 className="mt-1 text-2xl">{rw.name}</h1>
        <p className="mt-4 max-w-[60ch]">{rw.description}</p>
        <p className="data mt-4 text-sm text-ink/60">
          {list.length} {list.length === 1 ? "entry" : "entries"} gelogd
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-10">
        <h2 className="sr-only">Entries bij de {rw.name}</h2>
        {list.length === 0 ? (
          <p className="border-t border-rule pt-4 text-sm">
            Nog geen entries voor deze baan.{" "}
            <Link href="/">Bekijk het volledige log.</Link>
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <li key={e.id} className="border-t border-rule pt-3">
                <Link
                  href={`/log/${e.id}`}
                  className="text-ink no-underline"
                >
                  <div className="relative aspect-[3/2] bg-paper-2">
                    <Image
                      src={e.image.src}
                      alt={altText(e)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3">
                    {e.registration ? (
                      <span className="reg">{e.registration}</span>
                    ) : (
                      <span className="font-semibold">{e.type}</span>
                    )}
                  </p>
                  {e.registration && (
                    <p className="data mt-2 text-sm">{e.typeShort}</p>
                  )}
                  {e.operator && (
                    <p className="text-sm text-ink/70">{e.operator}</p>
                  )}
                  {e.spottedAt && (
                    <p className="data mt-1 text-xs text-ink/60">
                      {formatDate(e.spottedAt)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav
        aria-label="Andere banen"
        className="mx-auto max-w-[1240px] border-t border-rule px-5 py-8"
      >
        <h2 className="text-lg">Andere banen</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {Object.keys(RUNWAYS)
            .filter((c) => c !== upper)
            .map((c) => (
              <li key={c}>
                <Link href={`/baan/${c.toLowerCase()}`}>
                  <span className="data">{c}</span> {RUNWAYS[c].name}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}
