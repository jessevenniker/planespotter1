import Image from "next/image";
import Link from "next/link";
import { AIRCRAFT, COMPARISONS, comparisonSlug, fmt, getAircraft } from "@/lib/aircraft";
import { sortedEntries } from "@/lib/log";
import { altText } from "@/lib/photos";
import { familyOf } from "@/lib/spotdle";

export const metadata = {
  title: "Vliegtuigtypes op Schiphol: specificaties en herkennen",
  description:
    "Van Embraer tot Airbus A380: alle vliegtuigtypes die we op Schiphol spotten, met afmetingen, bereik, capaciteit en tips om ze te herkennen.",
  alternates: { canonical: "/vliegtuig" },
};

export default function AircraftIndex() {
  const all = sortedEntries();
  const makers = ["Airbus", "Boeing", "Embraer"] as const;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Vliegtuigtypes</h1>
      <p className="mt-3 max-w-[62ch]">
        De types die we op Schiphol spotten, met hun maten, bereik en de kenmerken
        waaraan je ze vanaf de dijk herkent.
      </p>

      {makers.map((maker) => (
        <div key={maker} className="mt-10">
          <h2 className="border-t border-ink pt-4 text-xl">{maker}</h2>
          <ul className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {AIRCRAFT.filter((a) => a.maker === maker).map((a) => {
              const logged = all.filter((e) => familyOf(e.type) === a.family);
              const cover = logged[0];
              const v = a.variants[a.main];
              return (
                <li key={a.slug} className="border-t border-rule pt-3">
                  <Link href={`/vliegtuig/${a.slug}`} className="block text-ink no-underline">
                    <div className="relative aspect-[3/2] bg-paper-2">
                      {cover && (
                        <Image src={cover.image.src} alt={altText(cover)} fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" />
                      )}
                    </div>
                    <p className="mt-3 text-lg font-semibold">
                      {a.name}
                      {a.nickname && <span className="font-normal text-ink/50"> · {a.nickname}</span>}
                    </p>
                    <p className="data mt-1 text-sm text-ink/70">
                      {v.name} · {fmt.m(v.length)} · {fmt.km(v.range)}
                    </p>
                    <p className="text-sm text-ink/60">{logged.length}× in het log</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-12">
        <h2 className="border-t border-ink pt-4 text-xl">Vergelijkingen</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {COMPARISONS.map(([x, y]) => (
            <li key={`${x}-${y}`}>
              <Link href={`/vergelijk/${comparisonSlug(x, y)}`}>
                {getAircraft(x)!.name} vs {getAircraft(y)!.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
