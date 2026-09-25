"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Viewfinder from "@/components/Viewfinder";
import { useSpotlog } from "@/lib/storage";
import {
  CATEGORIES,
  Category,
  Entry,
  altText,
  capitalize,
  dayKey,
  exposureLine,
  formatDayLong,
  formatMonth,
  formatSpotted,
  formatTime,
  lightOf,
  operatorSlug,
  specialReason,
  toViewItem,
} from "@/lib/photos";

type SortKey = "datum" | "registratie" | "type" | "maatschappij" | "brandpunt";
type View = "auto" | "log" | "foto";

type Filters = {
  q: string;
  op: string;
  soort: string;
  maand: string;
  sort: SortKey;
  dir: "asc" | "desc";
  view: View;
};

const DEFAULTS: Filters = {
  q: "",
  op: "",
  soort: "",
  maand: "",
  sort: "datum",
  dir: "desc",
  view: "auto",
};

const SORT_LABELS: Record<SortKey, string> = {
  datum: "Datum",
  registratie: "Registratie",
  type: "Type",
  maatschappij: "Maatschappij",
  brandpunt: "Brandpunt",
};

/** Waarde waarop een kolom sorteert. Onbekend sorteert altijd achteraan. */
const sortValue = (e: Entry, key: SortKey): string | number | null => {
  switch (key) {
    case "datum":
      return e.spottedAt;
    case "registratie":
      return e.registration;
    case "type":
      return e.type;
    case "maatschappij":
      return e.operator;
    case "brandpunt":
      return e.camera?.focalMm ?? null;
  }
};

/**
 * Het logboek op de homepage. De tabel staat volledig in de statische HTML, zodat
 * crawlers en taalmodellen hem kunnen lezen. Filters lezen de URL pas na het
 * laden in en schrijven hem terug, zodat een gefilterde weergave te delen is.
 */
export default function LogExplorer({ entries }: { entries: Entry[] }) {
  const [f, setF] = useState<Filters>(DEFAULTS);
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const [viewer, setViewer] = useState<number | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const spotlog = useSpotlog();
  const ready = useRef(false);

  // URL -> filters: na het laden en bij terug/vooruit in de browser. De server
  // kent de URL-parameters niet, dus dit kan pas na de hydratatie.
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      const next = { ...DEFAULTS };
      for (const k of Object.keys(DEFAULTS) as (keyof Filters)[]) {
        const v = p.get(k);
        if (v) (next as Record<string, string>)[k] = v;
      }
      setF(next);
      ready.current = true;
    };
    const frame = requestAnimationFrame(read);
    window.addEventListener("popstate", read);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("popstate", read);
    };
  }, []);

  // Filters -> URL, zonder de pagina te herladen of de geschiedenis te vullen.
  useEffect(() => {
    if (!ready.current) return;
    const p = new URLSearchParams();
    for (const k of Object.keys(DEFAULTS) as (keyof Filters)[]) {
      if (f[k] !== DEFAULTS[k]) p.set(k, String(f[k]));
    }
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  // "/" springt naar het zoekveld, zoals op veel logboeksites.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement;
      if (ev.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) {
        ev.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));

  const operatorOptions = useMemo(() => {
    const m = new Map<string, { name: string; n: number }>();
    for (const e of entries) {
      const s = operatorSlug(e);
      if (!s || !e.operator) continue;
      m.set(s, { name: e.operator, n: (m.get(s)?.n ?? 0) + 1 });
    }
    return [...m].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [entries]);

  const monthOptions = useMemo(
    () =>
      [...new Set(entries.map((e) => e.spottedAt?.slice(0, 7)).filter(Boolean))]
        .sort()
        .reverse() as string[],
    [entries]
  );

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const filtered = entries.filter(
      (e) =>
        (!q ||
          [e.registration, e.type, e.typeShort, e.operator, e.note]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q))) &&
        (!f.op || operatorSlug(e) === f.op) &&
        (!f.soort || e.category === f.soort) &&
        (!f.maand || e.spottedAt?.startsWith(f.maand))
    );
    const dir = f.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const va = sortValue(a, f.sort);
      const vb = sortValue(b, f.sort);
      if (va === vb) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va < vb ? -1 : 1) * dir;
    });
  }, [entries, f]);

  // Groeperen per spotdag zolang er op datum gesorteerd wordt.
  const groups = useMemo(() => {
    if (f.sort !== "datum") return [{ key: null as string | null, items: list }];
    const out: { key: string | null; items: Entry[] }[] = [];
    for (const e of list) {
      const k = dayKey(e);
      const last = out[out.length - 1];
      if (last && last.key === k) last.items.push(e);
      else out.push({ key: k, items: [e] });
    }
    return out;
  }, [list, f.sort]);

  const active = list.find((e) => e.id === activeId) ?? list[0] ?? null;
  const viewItems = useMemo(() => list.map(toViewItem), [list]);
  const openViewer = (id: string) => setViewer(Math.max(0, list.findIndex((e) => e.id === id)));
  const filtering = f.q || f.op || f.soort || f.maand;

  const sortButton = (key: SortKey) => {
    const on = f.sort === key;
    return (
      <button
        type="button"
        onClick={() =>
          set({
            sort: key,
            dir: on ? (f.dir === "asc" ? "desc" : "asc") : key === "datum" || key === "brandpunt" ? "desc" : "asc",
          })
        }
        className="inline-flex items-center gap-1 font-semibold hover:text-approach"
      >
        {SORT_LABELS[key]}
        <span aria-hidden className={on ? "text-ink" : "text-ink/25"}>
          {on && f.dir === "asc" ? "▲" : "▼"}
        </span>
      </button>
    );
  };
  const ariaSort = (key: SortKey) =>
    f.sort === key ? (f.dir === "asc" ? "ascending" : "descending") : "none";

  const showTable = f.view === "log" ? "" : f.view === "foto" ? "hidden" : "hidden sm:block";
  const showGrid = f.view === "foto" ? "" : f.view === "log" ? "hidden" : "sm:hidden";

  return (
    <>
      {active && (
        <section
          className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 md:grid-cols-[1.6fr_1fr] md:items-start"
          aria-label="Geselecteerde entry"
        >
          <button
            type="button"
            onClick={() => openViewer(active.id)}
            className="group relative block aspect-[3/2] w-full cursor-zoom-in bg-paper-2"
            aria-label={`Open ${active.registration ?? active.type} in de zoeker`}
          >
            <Image
              key={active.id}
              src={active.image.src}
              alt={altText(active)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 740px"
              className="hero-swap object-cover"
            />
            <span className="data absolute bottom-3 right-3 bg-ink/80 px-2 py-1 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Zoeker ⤢
            </span>
          </button>

          <div>
            {active.registration ? (
              <h2 className="text-2xl">
                <span className="reg">{active.registration}</span>
              </h2>
            ) : (
              <h2 className="text-2xl">{active.type}</h2>
            )}

            <dl className="mt-5 border-t border-rule text-sm">
              {active.registration && <Row label="Type" value={active.type} mono />}
              <Row label="Maatschappij" value={active.operator} />
              <Row label="Soort" value={CATEGORIES[active.category]} />
              <Row label="Gespot" value={formatSpotted(active.spottedAt)} mono />
              <Row
                label="Licht"
                value={
                  lightOf(active.sunAltitude) &&
                  `${lightOf(active.sunAltitude)!.label}, zon ${active.sunAltitude}°`
                }
              />
              <Row label="Belichting" value={active.camera && exposureLine(active.camera)} mono />
            </dl>

            {active.note && <p className="mt-5 max-w-[46ch] text-sm">{active.note}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/log/${active.id}`}
                className="inline-block border border-ink px-4 py-2 text-sm text-ink no-underline hover:bg-ink hover:text-paper"
              >
                Bekijk entry
              </Link>
              <button
                type="button"
                onClick={() => openViewer(active.id)}
                className="border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-approach"
              >
                Open de zoeker
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1240px] px-5 pb-12" aria-labelledby="logboek">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-ink pt-5">
          <h2 id="logboek" className="text-xl">
            Logboek
          </h2>
          <p className="text-sm text-ink/70" aria-live="polite">
            <span className="data">{list.length}</span> van{" "}
            <span className="data">{entries.length}</span> toestellen
            {filtering && (
              <>
                {" · "}
                <button type="button" className="text-approach underline" onClick={() => setF({ ...DEFAULTS, view: f.view })}>
                  Wis filters
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <label className="flex flex-col gap-1">
            <span className="text-ink/60">Zoek</span>
            <input
              ref={search}
              type="search"
              value={f.q}
              onChange={(ev) => set({ q: ev.target.value })}
              placeholder="Registratie, type of maatschappij  ( / )"
              className="border-b border-rule bg-transparent py-1.5 outline-none focus:border-approach"
            />
          </label>
          <Select label="Maatschappij" value={f.op} onChange={(op) => set({ op })}>
            <option value="">Alle maatschappijen</option>
            {operatorOptions.map(([slug, o]) => (
              <option key={slug} value={slug}>
                {o.name} ({o.n})
              </option>
            ))}
          </Select>
          <Select label="Soort" value={f.soort} onChange={(soort) => set({ soort })}>
            <option value="">Alle soorten</option>
            {(Object.keys(CATEGORIES) as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c]}
              </option>
            ))}
          </Select>
          <Select label="Maand" value={f.maand} onChange={(maand) => set({ maand })}>
            <option value="">Alle maanden</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </Select>
          <div className="flex flex-col gap-1">
            <span className="text-ink/60">Weergave</span>
            <div className="flex" role="group" aria-label="Weergave">
              {(["log", "foto"] as const).map((v) => {
                const on = f.view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ view: on ? "auto" : v })}
                    className={`border border-ink px-3 py-1.5 ${on ? "bg-ink text-paper" : "hover:bg-paper-2"} ${v === "foto" ? "-ml-px" : ""}`}
                  >
                    {v === "log" ? "Log" : "Contactvel"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {list.length === 0 && (
          <p className="mt-8 border-t border-rule pt-4 text-sm">
            Niets gevonden. Probeer een kortere zoekterm of{" "}
            <button type="button" className="text-approach underline" onClick={() => setF({ ...DEFAULTS, view: f.view })}>
              wis de filters
            </button>
            .
          </p>
        )}

        {/* Log: een echte tabel, per spotdag een eigen tbody. */}
        <div className={`mt-6 ${showTable}`}>
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Alle gelogde vliegtuigen met datum, tijd, registratie, type,
              maatschappij, soort en brandpuntsafstand. Kolomkoppen sorteren.
            </caption>
            <thead>
              <tr className="border-y border-rule text-left">
                <th scope="col" aria-sort={ariaSort("datum")} className="py-2 pr-4">{sortButton("datum")}</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Tijd</th>
                <th scope="col" aria-sort={ariaSort("registratie")} className="py-2 pr-4">{sortButton("registratie")}</th>
                <th scope="col" aria-sort={ariaSort("type")} className="py-2 pr-4">{sortButton("type")}</th>
                <th scope="col" aria-sort={ariaSort("maatschappij")} className="hidden py-2 pr-4 md:table-cell">{sortButton("maatschappij")}</th>
                <th scope="col" className="hidden py-2 pr-4 font-semibold lg:table-cell">Soort</th>
                <th scope="col" aria-sort={ariaSort("brandpunt")} className="hidden py-2 pr-4 lg:table-cell">{sortButton("brandpunt")}</th>
                <th scope="col" className="py-2 text-right font-semibold">
                  <Link href="/mijn-spotlog" className="text-ink no-underline hover:underline">Gezien</Link>
                </th>
              </tr>
            </thead>
            {groups.map((g, gi) => (
              <tbody key={g.key ?? `g${gi}`}>
                {f.sort === "datum" && (
                  <tr>
                    <th colSpan={8} scope="rowgroup" className="pb-2 pt-6 text-left font-normal">
                      {g.key ? (
                        <Link href={`/dag/${g.key}`} className="text-ink no-underline hover:underline">
                          <span className="font-semibold">{capitalize(formatDayLong(g.key))}</span>
                        </Link>
                      ) : (
                        <span className="font-semibold">Datum onbekend</span>
                      )}
                      <span className="ml-3 text-ink/60">
                        <span className="data">{g.items.length}</span>{" "}
                        {g.items.length === 1 ? "toestel" : "toestellen"}
                      </span>
                    </th>
                  </tr>
                )}
                {g.items.map((e) => (
                  <tr
                    key={e.id}
                    onMouseEnter={() => setActiveId(e.id)}
                    onFocus={() => setActiveId(e.id)}
                    className={`border-b border-rule/60 ${active?.id === e.id ? "bg-paper-2" : ""}`}
                  >
                    <td className="data whitespace-nowrap py-2.5 pr-4 align-baseline text-ink/70">
                      {e.spottedAt?.slice(0, 10) ?? ""}
                    </td>
                    <td className="data py-2.5 pr-4 align-baseline text-ink/70">{formatTime(e.spottedAt) ?? ""}</td>
                    <td className="py-2.5 pr-4 align-baseline">
                      {e.registration && (
                        <Link href={`/log/${e.id}`} className="data text-ink no-underline hover:underline">
                          {e.registration}
                        </Link>
                      )}
                    </td>
                    <td className="data py-2.5 pr-4 align-baseline">
                      {e.registration ? (
                        e.typeShort
                      ) : (
                        <Link href={`/log/${e.id}`} className="text-ink">
                          {e.typeShort}
                        </Link>
                      )}
                      {specialReason(e) && (
                        <span className="ml-2 bg-plate px-1 text-[0.7rem] font-sans text-ink" title={specialReason(e)!}>
                          ★
                        </span>
                      )}
                    </td>
                    <td className="hidden py-2.5 pr-4 align-baseline md:table-cell">
                      {e.operator && (
                        <Link href={`/maatschappij/${operatorSlug(e)}`} className="text-ink no-underline hover:underline">
                          {e.operator}
                        </Link>
                      )}
                    </td>
                    <td className="hidden py-2.5 pr-4 align-baseline text-ink/70 lg:table-cell">{CATEGORIES[e.category]}</td>
                    <td className="data hidden py-2.5 pr-4 text-right align-baseline text-ink/70 lg:table-cell">
                      {e.camera ? `${e.camera.focalMm} mm` : ""}
                    </td>
                    <td className="py-1.5 text-right align-baseline">
                      <button
                        type="button"
                        aria-pressed={spotlog.has(e.id)}
                        aria-label={`${e.registration ?? e.type} gezien`}
                        onClick={() => spotlog.toggle(e.id)}
                        className={`h-6 w-6 border text-xs ${spotlog.has(e.id) ? "border-approach bg-approach text-paper" : "border-rule text-transparent hover:border-ink hover:text-ink/40"}`}
                      >
                        ✓
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {/* Contactvel: dezelfde entries als foto's, per spotdag. */}
        <div className={`mt-6 ${showGrid}`}>
          {groups.map((g, gi) => (
            <section key={g.key ?? `g${gi}`} className="mt-8 first:mt-0">
              {f.sort === "datum" && (
                <h3 className="border-t border-rule pt-3 text-base">
                  {g.key ? (
                    <Link href={`/dag/${g.key}`} className="text-ink no-underline">
                      {capitalize(formatDayLong(g.key))}
                    </Link>
                  ) : (
                    "Datum onbekend"
                  )}
                  <span className="data ml-3 text-sm font-normal text-ink/60">{g.items.length}</span>
                </h3>
              )}
              <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => openViewer(e.id)}
                      className="relative block aspect-[3/2] w-full cursor-zoom-in bg-paper-2"
                      aria-label={`Open ${e.registration ?? e.type} in de zoeker`}
                    >
                      <Image
                        src={e.image.src}
                        alt={altText(e)}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover"
                      />
                      {specialReason(e) && (
                        <span className="absolute left-1.5 top-1.5 bg-plate px-1.5 text-[0.7rem] text-ink">★</span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-pressed={spotlog.has(e.id)}
                      onClick={() => spotlog.toggle(e.id)}
                      className={`mt-1.5 w-full border py-1 text-xs ${spotlog.has(e.id) ? "border-approach bg-approach text-paper" : "border-rule text-ink/60 hover:border-ink"}`}
                    >
                      {spotlog.has(e.id) ? "✓ Gezien" : "Ook gezien?"}
                    </button>
                    <Link href={`/log/${e.id}`} className="mt-2 block text-sm text-ink no-underline">
                      {e.registration ? <span className="reg text-xs">{e.registration}</span> : <span className="font-semibold">{e.typeShort}</span>}
                      <span className="block text-ink/70">
                        {e.registration && <span className="data">{e.typeShort} · </span>}
                        {e.operator ?? CATEGORIES[e.category]}
                      </span>
                      <span className="data block text-xs text-ink/50">{formatSpotted(e.spottedAt) ?? ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {viewer !== null && viewItems.length > 0 && (
        <Viewfinder items={viewItems} start={viewer} onClose={() => setViewer(null)} />
      )}
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-ink/60">{label}</span>
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="border-b border-rule bg-transparent py-1.5 outline-none focus:border-approach"
      >
        {children}
      </select>
    </label>
  );
}

/** Een metadata-regel. Zonder waarde wordt er niets getoond. */
function Row({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-rule py-2">
      <dt className="text-ink/60">{label}</dt>
      <dd className={mono ? "data text-right" : "text-right"}>{value}</dd>
    </div>
  );
}
