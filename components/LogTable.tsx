"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Entry,
  altText,
  formatDate,
  formatTime,
  displayId,
  availableSizes,
} from "@/lib/photos";

/**
 * De logtabel is een echte <table>. Dat is geen detail: het maakt de gegevens
 * leesbaar voor screenreaders én voor de crawlers van taalmodellen, die
 * tabellen betrouwbaarder interpreteren dan een stapel divs.
 *
 * Het enige bewegende element op de pagina zit hier: door een rij aan te wijzen
 * of te focussen wisselt de foto erboven.
 */
export default function LogTable({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState(0);
  const e = entries[active];

  return (
    <>
      <section
        className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 md:grid-cols-[1.6fr_1fr] md:items-start"
        aria-label="Meest recente entry"
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
          <h1 className="text-2xl">
            <span className="reg">{displayId(e)}</span>
          </h1>

          <dl className="mt-5 border-t border-rule text-sm">
            <Row label="Type" value={e.type} mono />
            <Row label="Maatschappij" value={e.operator} />
            <Row label="Baan" value={e.runway ?? "nog invullen"} mono />
            <Row label="Locatie" value={e.location ?? "nog invullen"} />
            <Row
              label="Gespot"
              value={`${formatDate(e.spottedAt)} ${formatTime(e.spottedAt)}`}
              mono
            />
          </dl>

          <p className="mt-5 max-w-[46ch] text-sm">{e.note}</p>

          <Link
            href={`/log/${e.id}`}
            className="mt-6 inline-block border border-ink px-4 py-2 text-sm text-ink no-underline hover:bg-ink hover:text-paper"
          >
            {availableSizes(e).length > 0 ? (
              <>
                Bekijk entry, print vanaf{" "}
                <span className="data">€{availableSizes(e)[0].priceEur}</span>
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
            Alle gelogde vliegtuigen, met registratie, type, maatschappij, baan
            en datum. Nieuwste bovenaan.
          </caption>
          <thead>
            <tr className="border-y border-rule text-left">
              <Th>Datum</Th>
              <Th>Registratie</Th>
              <Th>Type</Th>
              <Th className="hidden sm:table-cell">Maatschappij</Th>
              <Th className="hidden sm:table-cell">Baan</Th>
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
                <td className="data py-2.5 pr-4 align-baseline text-ink/70">
                  {formatDate(entry.spottedAt)}
                </td>
                <td className="py-2.5 pr-4 align-baseline">
                  <Link
                    href={`/log/${entry.id}`}
                    className="data text-ink no-underline"
                  >
                    {displayId(entry)}
                  </Link>
                </td>
                <td className="data py-2.5 pr-4 align-baseline">
                  {entry.typeShort}
                </td>
                <td className="hidden py-2.5 pr-4 align-baseline sm:table-cell">
                  {entry.operator}
                </td>
                <td className="data hidden py-2.5 align-baseline sm:table-cell">
                  {entry.runway}
                </td>
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

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-rule py-2">
      <dt className="text-ink/60">{label}</dt>
      <dd className={mono ? "data text-right" : "text-right"}>{value}</dd>
    </div>
  );
}
