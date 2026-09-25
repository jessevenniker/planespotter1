"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Entry,
  altText,
  formatDate,
  formatSpotted,
  availableSizes,
} from "@/lib/photos";

/**
 * De logtabel is een echte <table>. Dat is geen detail: het maakt de gegevens
 * leesbaar voor screenreaders én voor de crawlers van taalmodellen, die
 * tabellen betrouwbaarder interpreteren dan een stapel divs.
 *
 * Het enige bewegende element op de pagina zit hier: door een rij aan te wijzen
 * of te focussen wisselt de foto erboven.
 *
 * Alleen vastgelegde waarden worden getoond. Een kolom die voor geen enkele
 * entry gevuld is, verschijnt niet.
 */
export default function LogTable({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState(0);
  const e = entries[active];

  const cols = {
    datum: entries.some((x) => x.spottedAt),
    registratie: entries.some((x) => x.registration),
    maatschappij: entries.some((x) => x.operator),
    baan: entries.some((x) => x.runway),
  };

  const sizes = availableSizes(e);

  return (
    <>
      <section
        className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 md:grid-cols-[1.6fr_1fr] md:items-start"
        aria-label="Geselecteerde entry"
      >
        <div className="relative aspect-[3/2] bg-paper-2">
          <Image
            key={e.id}
            src={e.image.src}
            alt={altText(e)}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 740px"
            className="hero-swap object-cover"
          />
        </div>

        <div>
          {e.registration ? (
            <h1 className="text-2xl">
              <span className="reg">{e.registration}</span>
            </h1>
          ) : (
            <h1 className="text-2xl">{e.type}</h1>
          )}

          <dl className="mt-5 border-t border-rule text-sm">
            {e.registration && <Row label="Type" value={e.type} mono />}
            <Row label="Maatschappij" value={e.operator} />
            <Row label="Baan" value={e.runway} mono />
            <Row label="Locatie" value={e.location} />
            <Row label="Gespot" value={formatSpotted(e.spottedAt)} mono />
          </dl>

          <p className="mt-5 max-w-[46ch] text-sm">{e.note}</p>

          <Link
            href={`/log/${e.id}`}
            className="mt-6 inline-block border border-ink px-4 py-2 text-sm text-ink no-underline hover:bg-ink hover:text-paper"
          >
            {e.forSale && sizes.length > 0 ? (
              <>
                Bekijk entry, print vanaf{" "}
                <span className="data">€{sizes[0].priceEur}</span>
              </>
            ) : (
              "Bekijk entry"
            )}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-10">
        <h2 className="sr-only">Volledig logboek</h2>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Alle gelogde vliegtuigen. Nieuwste bovenaan.
          </caption>
          <thead>
            <tr className="border-y border-rule text-left">
              {cols.datum && <Th>Datum</Th>}
              {cols.registratie && <Th>Registratie</Th>}
              <Th>Type</Th>
              {cols.maatschappij && (
                <Th className="hidden sm:table-cell">Maatschappij</Th>
              )}
              {cols.baan && <Th className="hidden sm:table-cell">Baan</Th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.id}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={
                  "border-b border-rule/60 " +
                  (i === active ? "bg-paper-2" : "")
                }
              >
                {cols.datum && (
                  <td className="data py-2.5 pr-4 align-baseline text-ink/70">
                    {formatDate(entry.spottedAt)}
                  </td>
                )}
                {cols.registratie && (
                  <td className="py-2.5 pr-4 align-baseline">
                    {entry.registration && (
                      <Link
                        href={`/log/${entry.id}`}
                        className="data text-ink no-underline"
                      >
                        {entry.registration}
                      </Link>
                    )}
                  </td>
                )}
                <td className="data py-2.5 pr-4 align-baseline">
                  {entry.registration ? (
                    entry.typeShort
                  ) : (
                    <Link href={`/log/${entry.id}`} className="text-ink">
                      {entry.typeShort}
                    </Link>
                  )}
                </td>
                {cols.maatschappij && (
                  <td className="hidden py-2.5 pr-4 align-baseline sm:table-cell">
                    {entry.operator}
                  </td>
                )}
                {cols.baan && (
                  <td className="data hidden py-2.5 align-baseline sm:table-cell">
                    {entry.runway}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th scope="col" className={`py-2 pr-4 font-semibold ${className}`}>
      {children}
    </th>
  );
}

/** Een metadata-regel. Zonder waarde wordt er niets getoond. */
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
