import Link from "next/link";
import { BarList, Columns, DataTable, Datum } from "@/components/Charts";
import {
  CATEGORIES,
  Category,
  Entry,
  formatDayLong,
  formatMonth,
  formatSpotted,
  lightOf,
} from "@/lib/photos";
import { operators, sortedEntries, stats } from "@/lib/log";

export const metadata = {
  title: "Statistieken",
  description:
    "Het logboek in cijfers: meest gespotte maatschappijen, de drukste uren, de brandpuntsafstanden en de records.",
  alternates: { canonical: "/statistieken" },
};

const count = <T,>(list: T[], key: (x: T) => string | null) => {
  const m = new Map<string, number>();
  for (const x of list) {
    const k = key(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};

export default function StatsPage() {
  const all = sortedEntries();
  const s = stats();

  const ops = operators();
  const top = ops.slice(0, 12);
  const rest = ops.slice(12).reduce((n, o) => n + o.entries.length, 0);
  const operatorData: Datum[] = [
    ...top.map((o) => ({ label: o.name, value: o.entries.length, href: `/maatschappij/${o.slug}` })),
    ...(rest ? [{ label: `Overig (${ops.length - 12})`, value: rest }] : []),
  ];

  const hours = count(all, (e) => e.spottedAt?.slice(11, 13) ?? null);
  const hourData: Datum[] = Array.from({ length: 24 }, (_, h) => {
    const k = String(h).padStart(2, "0");
    return { label: k, value: hours.get(k) ?? 0, hint: `${k}:00–${k}:59` };
  });

  const months = count(all, (e) => e.spottedAt?.slice(0, 7) ?? null);
  const monthKeys = [...months.keys()].sort();
  // Alle maanden tussen de eerste en de laatste, ook de lege: gaten horen erbij.
  const monthData: Datum[] = [];
  if (monthKeys.length) {
    let [y, m] = monthKeys[0].split("-").map(Number);
    const [ey, em] = monthKeys[monthKeys.length - 1].split("-").map(Number);
    while (y < ey || (y === ey && m <= em)) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      monthData.push({ label: m === 1 || monthData.length === 0 ? k : k.slice(5), value: months.get(k) ?? 0, hint: formatMonth(k) });
      m++;
      if (m > 12) { m = 1; y++; }
    }
  }

  const focalBuckets = count(all, (e) =>
    e.camera ? `${Math.min(Math.floor(e.camera.focalMm / 100) * 100, 600)}` : null
  );
  const focalData: Datum[] = [100, 200, 300, 400, 500, 600].map((b) => ({
    label: b === 600 ? "600 mm" : `${b}–${b + 99} mm`,
    value: focalBuckets.get(String(b)) ?? 0,
  }));

  const catCount = count(all, (e) => e.category);
  const catData: Datum[] = (Object.keys(CATEGORIES) as Category[])
    .map((c) => ({ label: CATEGORIES[c], value: catCount.get(c) ?? 0 }))
    .filter((d) => d.value);

  const lightCount = count(all, (e) => lightOf(e.sunAltitude)?.label ?? null);
  const lightData: Datum[] = ["Daglicht", "Gouden uur", "Blauwe uur", "Donker"]
    .map((l) => ({ label: l, value: lightCount.get(l) ?? 0 }))
    .filter((d) => d.value);

  const typeCount = count(all, (e) => e.type);
  const typeData: Datum[] = [...typeCount]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }));

  const records: { label: string; value: string; e: Entry | null }[] = [
    { label: "Langste lens", value: s.longestLens?.camera ? `${s.longestLens.camera.focalMm} mm` : "–", e: s.longestLens },
    { label: "Kortste sluitertijd", value: s.fastestShutter?.camera?.shutter ?? "–", e: s.fastestShutter },
    { label: "Hoogste ISO", value: s.highestIso?.camera?.iso ? `ISO ${s.highestIso.camera.iso}` : "–", e: s.highestIso },
    { label: "Donkerste foto", value: s.darkest ? `zon ${s.darkest.sunAltitude}°` : "–", e: s.darkest },
    { label: "Eerste in het log", value: formatSpotted(s.first?.spottedAt ?? null) ?? "–", e: s.first },
    { label: "Laatste in het log", value: formatSpotted(s.last?.spottedAt ?? null) ?? "–", e: s.last },
  ];

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Statistieken</h1>
      <p className="mt-6 text-[3.5rem] font-semibold leading-none">{s.total}</p>
      <p className="mt-2 text-ink/70">
        toestellen op <span className="data">{s.days}</span> spotdagen, van{" "}
        <span className="data">{s.operators}</span> maatschappijen en{" "}
        <span className="data">{s.types}</span> types.
        {s.busiest && (
          <>
            {" "}Drukste dag:{" "}
            <Link href={`/dag/${s.busiest.key}`}>{formatDayLong(s.busiest.key)}</Link>, met{" "}
            <span className="data">{s.busiest.entries.length}</span> toestellen.
          </>
        )}
      </p>

      <h2 className="mt-12 border-t border-ink pt-4 text-xl">Records</h2>
      <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <li key={r.label} className="border-t border-rule pt-3 text-sm">
            <p className="text-ink/60">{r.label}</p>
            <p className="data mt-1 text-lg">{r.value}</p>
            {r.e && (
              <Link href={`/log/${r.e.id}`}>
                {r.e.registration ?? r.e.type}
                {r.e.operator && `, ${r.e.operator}`}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Meest gespotte maatschappijen</h2>
          <div className="mt-5">
            <BarList data={operatorData} />
          </div>
          <DataTable data={operatorData} labelHeader="Maatschappij" valueHeader="Toestellen" />
        </figure>

        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Meest gespotte types</h2>
          <div className="mt-5">
            <BarList data={typeData} />
          </div>
          <DataTable data={typeData} labelHeader="Type" valueHeader="Toestellen" />
        </figure>

        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Foto&apos;s per uur van de dag</h2>
          <p className="mt-1 text-sm text-ink/60">Lokale tijd, uit de camera.</p>
          <div className="mt-8">
            <Columns data={hourData} labelEvery={3} />
          </div>
          <DataTable data={hourData} labelHeader="Uur" valueHeader="Foto's" />
        </figure>

        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Foto&apos;s per maand</h2>
          <p className="mt-1 text-sm text-ink/60">Van de eerste tot de laatste spotdag, lege maanden meegeteld.</p>
          <div className="mt-8">
            <Columns data={monthData} labelEvery={3} />
          </div>
          <DataTable data={monthData} labelHeader="Maand" valueHeader="Foto's" />
        </figure>

        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Brandpuntsafstand</h2>
          <p className="mt-1 text-sm text-ink/60">Hoe ver er ingezoomd is, uit de EXIF.</p>
          <div className="mt-5">
            <BarList data={focalData} />
          </div>
          <DataTable data={focalData} labelHeader="Brandpunt" valueHeader="Foto's" />
        </figure>

        <figure>
          <h2 className="border-t border-ink pt-4 text-xl">Soort en licht</h2>
          <p className="mt-1 text-sm text-ink/60">
            Licht berekend uit de zonnehoogte boven Schiphol op het moment van de foto.
          </p>
          <div className="mt-5 grid gap-6">
            <BarList data={catData} />
            <BarList data={lightData} />
          </div>
          <DataTable data={[...catData, ...lightData]} labelHeader="Soort of licht" valueHeader="Foto's" />
        </figure>
      </div>

      <p className="mt-12 text-sm text-ink/60">
        Alle cijfers komen rechtstreeks uit het logboek en werken automatisch bij
        als er foto&apos;s bijkomen.
      </p>
    </section>
  );
}
