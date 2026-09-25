import Image from "next/image";
import Link from "next/link";
import { altText, capitalize, formatDayLong, formatTime } from "@/lib/photos";
import { days } from "@/lib/log";

export const metadata = {
  title: "Spotdagen op Schiphol",
  description:
    "Elke dag dat er op Schiphol gespot is, met het aantal toestellen, de tijden en de maatschappijen.",
  alternates: { canonical: "/dag" },
};

export default function DaysIndex() {
  const list = days();
  // Per jaar groeperen: zo leest de lijst als een logboek.
  const years = [...new Set(list.map((d) => d.key.slice(0, 4)))];

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Spotdagen</h1>
      <p className="mt-3 max-w-[60ch]">
        <span className="data">{list.length}</span> dagen aan de rand van
        Schiphol. Per dag de toestellen in de volgorde waarin ze voorbijkwamen.
      </p>

      {years.map((y) => (
        <div key={y} className="mt-10">
          <h2 className="data text-xl">{y}</h2>
          <ul className="mt-4 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {list
              .filter((d) => d.key.startsWith(y))
              .map((d) => {
                const cover = d.entries[0];
                return (
                  <li key={d.key} className="border-t border-rule pt-3">
                    <Link href={`/dag/${d.key}`} className="block text-ink no-underline">
                      <div className="grid grid-cols-3 gap-[2px]">
                        {d.entries.slice(0, 3).map((e) => (
                          <div key={e.id} className="relative aspect-square bg-paper-2">
                            <Image src={e.image.src} alt={altText(e)} fill sizes="130px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 font-semibold">{capitalize(formatDayLong(d.key))}</p>
                      <p className="data text-sm text-ink/70">
                        {d.entries.length} {d.entries.length === 1 ? "toestel" : "toestellen"} ·{" "}
                        {formatTime(cover.spottedAt)}–{formatTime(d.entries[d.entries.length - 1].spottedAt)}
                      </p>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </section>
  );
}
