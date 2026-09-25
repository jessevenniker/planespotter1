import Link from "next/link";

// Eenvoudige grafieken in HTML, zonder bibliotheek. Eén reeks per grafiek, dus
// één kleur en geen legenda: de titel zegt wat er staat. Staven zijn hooguit
// 24 px dik, met een afgeronde kop en een rechte voet. Elke grafiek heeft een
// tabelweergave, zodat niets alleen via de grafiek te lezen is.

export type Datum = { label: string; value: number; href?: string; hint?: string };

/** Liggende staven met het getal aan de kop. Voor ranglijsten met lange labels. */
export function BarList({ data, unit = "" }: { data: Datum[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ol className="space-y-1.5 text-sm">
      {data.map((d) => (
        <li
          key={d.label}
          className="grid grid-cols-[minmax(7rem,12rem)_1fr] items-center gap-3"
          title={`${d.label}: ${d.value}${unit}`}
        >
          <span className="truncate">
            {d.href ? (
              <Link href={d.href} className="text-ink no-underline hover:underline">
                {d.label}
              </Link>
            ) : (
              d.label
            )}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="block h-4 rounded-r bg-approach"
              style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            />
            <span className="data text-ink/70">
              {d.value}
              {unit}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Staande kolommen met een tooltip bij hover en toetsenbordfocus. Alleen de
 * hoogste kolom krijgt een getal; de rest staat in de tooltip en de tabel.
 */
export function Columns({
  data,
  labelEvery = 1,
  height = 160,
}: {
  data: Datum[];
  labelEvery?: number;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const top = data.findIndex((d) => d.value === max);
  return (
    <div>
      <div className="relative flex items-end gap-[2px] border-b border-rule" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            tabIndex={0}
            className="group relative flex h-full flex-1 items-end outline-none"
            aria-label={`${d.label}: ${d.value}`}
          >
            <div
              className="mx-auto w-full max-w-6 rounded-t bg-approach group-hover:bg-ink group-focus:bg-ink"
              style={{ height: d.value ? `${(d.value / max) * 100}%` : 0 }}
            />
            {i === top && d.value > 0 && (
              <span
                className="data absolute left-1/2 -translate-x-1/2 text-xs text-ink/70"
                style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}
              >
                {d.value}
              </span>
            )}
            <span className="data pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-1 text-xs text-paper group-hover:block group-focus:block">
              {d.hint ?? d.label}: {d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <span key={d.label} className="data flex-1 whitespace-nowrap text-center text-[0.65rem] text-ink/60">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** De tabelweergave onder een grafiek. */
export function DataTable({
  data,
  labelHeader,
  valueHeader,
}: {
  data: Datum[];
  labelHeader: string;
  valueHeader: string;
}) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-ink/60">Bekijk als tabel</summary>
      <table className="mt-2 w-full max-w-md border-collapse">
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="py-1 pr-4 font-semibold">{labelHeader}</th>
            <th scope="col" className="py-1 text-right font-semibold">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label} className="border-b border-rule/60">
              <td className="py-1 pr-4">{d.hint ?? d.label}</td>
              <td className="data py-1 text-right">{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
