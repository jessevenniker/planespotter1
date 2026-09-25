"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSpotdleHistory, useSpotlog } from "@/lib/storage";

export type LogItem = {
  id: string;
  label: string;
  type: string;
  typeShort: string;
  operator: string | null;
  operatorSlug: string | null;
  category: string;
  family: string | null;
  light: string | null;
  special: string | null;
  date: string | null;
  src: string;
};

const HEAVIES = [
  "Airbus A300", "Airbus A330", "Airbus A340", "Airbus A350", "Airbus A380", "Airbus BelugaXL",
  "Boeing 747", "Boeing 767", "Boeing 777", "Boeing 787",
];

type Badge = { id: string; title: string; text: string; need: number; have: number };

/** De badges: elk met een doel en hoe ver je bent. */
const badges = (seen: LogItem[], all: LogItem[], spotdleStreak: number): Badge[] => {
  const n = (f: (i: LogItem) => boolean) => seen.filter(f).length;
  const operators = new Set(seen.map((i) => i.operator).filter(Boolean)).size;
  return [
    { id: "eerste", title: "Eerste vangst", text: "Je eerste toestel in je spotlog.", need: 1, have: seen.length },
    { id: "tien", title: "Logboek loopt", text: "Tien toestellen gezien.", need: 10, have: seen.length },
    { id: "vijftig", title: "Vijftig op de teller", text: "Vijftig toestellen gezien.", need: 50, have: seen.length },
    { id: "heavy", title: "Heavy-jager", text: "Tien widebodies: 777, 787, A350, A380 en hun maten.", need: 10, have: n((i) => HEAVIES.includes(i.family ?? "")) },
    { id: "vracht", title: "Vrachtvlieger", text: "Vijf vrachttoestellen.", need: 5, have: n((i) => i.category === "vracht") },
    { id: "nacht", title: "Nachtspotter", text: "Drie toestellen in het blauwe uur of het donker.", need: 3, have: n((i) => i.light === "blauwe-uur" || i.light === "donker") },
    { id: "goud", title: "Gouden uur", text: "Vijf toestellen in het gouden uur.", need: 5, have: n((i) => i.light === "gouden-uur") },
    { id: "blauw", title: "Blauw bloed", text: "Vijftien toestellen van KLM, Cityhopper of KLM Cargo.", need: 15, have: n((i) => (i.operator ?? "").startsWith("KLM")) },
    { id: "wereld", title: "Wereldreiziger", text: "Vijftien verschillende maatschappijen.", need: 15, have: operators },
    { id: "zeldzaam", title: "Oog voor bijzonder", text: "Vijf toestellen uit de collectie Bijzonder.", need: 5, have: n((i) => i.special !== null) },
    { id: "walvis", title: "De walvis", text: "De Airbus BelugaXL gezien.", need: 1, have: n((i) => i.family === "Airbus BelugaXL") },
    { id: "grijs", title: "Grijze jongens", text: "Een militair toestel gezien.", need: 1, have: n((i) => i.category === "militair") },
    { id: "zakelijk", title: "Private terminal", text: "Drie zakenjets.", need: 3, have: n((i) => i.category === "zakenjet") },
    { id: "spotdle", title: "Spotdle-reeks", text: "Drie dagen op rij Spotdle geraden.", need: 3, have: spotdleStreak },
    { id: "compleet", title: "Complete hangar", text: `Alle ${all.length} toestellen uit het log.`, need: all.length, have: seen.length },
  ];
};

export default function SpotlogDashboard({ items }: { items: LogItem[] }) {
  const { seen: ids, has, toggle, setSeen } = useSpotlog();
  const [history] = useSpotdleHistory();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const seen = items.filter((i) => ids.includes(i.id));
  // Langste Spotdle-reeks, uit de geschiedenis van het spel.
  const wonDays = Object.entries(history).filter(([, r]) => r.won).map(([k]) => Number(k)).sort((a, b) => a - b);
  let spotdleStreak = 0;
  for (let i = 0, run = 0; i < wonDays.length; i++) {
    run = i > 0 && wonDays[i - 1] === wonDays[i] - 1 ? run + 1 : 1;
    spotdleStreak = Math.max(spotdleStreak, run);
  }
  const list = badges(seen, items, spotdleStreak);
  const earned = list.filter((b) => b.have >= b.need);

  // Voortgang per maatschappij, meest gespot bovenaan.
  const groups = [...items.reduce((m, i) => {
    const key = i.operator ?? "Zonder maatschappij";
    return m.set(key, [...(m.get(key) ?? []), i]);
  }, new Map<string, LogItem[]>())].sort((a, b) => b[1].length - a[1].length);

  const families = [...items.reduce((m, i) => {
    if (!i.family) return m;
    return m.set(i.family, [...(m.get(i.family) ?? []), i]);
  }, new Map<string, LogItem[]>())].sort((a, b) => b[1].length - a[1].length);

  const wanted = items.filter((i) => i.special && !has(i.id)).slice(0, 6);

  const exportCode = () => {
    const c = btoa(ids.join(","));
    navigator.clipboard?.writeText(c).then(
      () => setMessage("Code gekopieerd. Plak hem op een ander apparaat om je spotlog mee te nemen."),
      () => setMessage(`Je code: ${c}`)
    );
  };
  const importCode = () => {
    try {
      const incoming = atob(code.trim()).split(",").filter((id) => items.some((i) => i.id === id));
      setSeen([...new Set([...ids, ...incoming])]);
      setMessage(`${incoming.length} toestellen toegevoegd.`);
      setCode("");
    } catch {
      setMessage("Deze code herken ik niet. Kopieer hem opnieuw en probeer het nog eens.");
    }
  };

  return (
    <div>
      <section className="border-y border-ink py-6">
        <p className="text-sm text-ink/60">Gezien</p>
        <p className="mt-1 text-[3.5rem] font-semibold leading-none">
          {seen.length}
          <span className="text-2xl text-ink/40"> / {items.length}</span>
        </p>
        <div className="mt-4 h-3 w-full bg-paper-2" aria-hidden>
          <div className="h-3 bg-approach" style={{ width: `${(seen.length / items.length) * 100}%` }} />
        </div>
        <p className="mt-3 text-sm text-ink/70">
          {seen.length === 0 ? (
            <>
              Nog niks afgevinkt. Heb je een van deze toestellen zelf ook gezien? Vink ze
              hieronder af, of tik op een entry op <em>Ook gezien</em>.
            </>
          ) : (
            <>
              <span className="data">{earned.length}</span> van <span className="data">{list.length}</span> badges
              verdiend. Je spotlog staat alleen op dit apparaat.
            </>
          )}
        </p>
      </section>

      <section className="mt-10" aria-labelledby="badges">
        <h2 id="badges" className="text-xl">Badges</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const done = b.have >= b.need;
            return (
              <li key={b.id} className={`border p-4 ${done ? "border-ink bg-ink text-paper" : "border-rule"}`}>
                <p className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {done && <span className="mr-1.5 text-plate">★</span>}
                    {b.title}
                  </span>
                  <span className={`data text-xs ${done ? "text-plate" : "text-ink/50"}`}>
                    {Math.min(b.have, b.need)}/{b.need}
                  </span>
                </p>
                <p className={`mt-1 text-sm ${done ? "text-paper/70" : "text-ink/60"}`}>{b.text}</p>
                {!done && (
                  <div className="mt-3 h-1.5 bg-paper-2" aria-hidden>
                    <div className="h-1.5 bg-approach" style={{ width: `${(b.have / b.need) * 100}%` }} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {wanted.length > 0 && (
        <section className="mt-10" aria-labelledby="gezocht">
          <h2 id="gezocht" className="text-xl">Nog op je lijst</h2>
          <p className="mt-1 text-sm text-ink/60">Bijzondere toestellen die je nog niet hebt afgevinkt.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {wanted.map((i) => (
              <li key={i.id}>
                <Link href={`/log/${i.id}`} className="block text-sm text-ink no-underline">
                  <span className="relative block aspect-[3/2] bg-paper-2">
                    <Image src={i.src} alt={i.label} fill sizes="200px" className="object-cover" />
                  </span>
                  <span className="mt-1.5 block font-semibold">{i.typeShort}</span>
                  <span className="block text-ink/60">{i.special}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="families">
          <h2 id="families" className="text-xl">Per type</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {families.map(([f, list]) => {
              const got = list.filter((i) => has(i.id)).length;
              return (
                <li key={f} className="grid grid-cols-[10rem_1fr_3.5rem] items-center gap-3">
                  <span>{f}</span>
                  <span className="h-2 bg-paper-2" aria-hidden>
                    <span className="block h-2 bg-approach" style={{ width: `${(got / list.length) * 100}%` }} />
                  </span>
                  <span className="data text-right">{got}/{list.length}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="afvinken">
          <h2 id="afvinken" className="text-xl">Afvinklijst per maatschappij</h2>
          <p className="mt-1 text-sm text-ink/60">Open een maatschappij en vink af wat je zelf gezien hebt.</p>
          <ul className="mt-4 border-t border-rule text-sm">
            {groups.map(([name, list]) => {
              const got = list.filter((i) => has(i.id)).length;
              const open = openGroup === name;
              return (
                <li key={name} className="border-b border-rule">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenGroup(open ? null : name)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-paper-2"
                  >
                    <span className="font-semibold">{name}</span>
                    <span className="data text-ink/60">
                      {got}/{list.length} {open ? "▲" : "▼"}
                    </span>
                  </button>
                  {open && (
                    <ul className="pb-3">
                      {list.map((i) => (
                        <li key={i.id}>
                          <label className="flex cursor-pointer items-center gap-3 py-1.5 pl-2">
                            <input
                              type="checkbox"
                              checked={has(i.id)}
                              onChange={() => toggle(i.id)}
                              className="h-4 w-4 accent-[#3e6b87]"
                            />
                            <span className="data">{i.label}</span>
                            <span className="text-ink/60">{i.date ?? ""}</span>
                            <Link href={`/log/${i.id}`} className="ml-auto text-xs">
                              bekijk
                            </Link>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mt-12 border-t border-ink pt-4" aria-labelledby="backup">
        <h2 id="backup" className="text-xl">Meenemen naar een ander apparaat</h2>
        <p className="mt-1 max-w-[60ch] text-sm text-ink/70">
          Er zijn geen accounts: je spotlog staat in deze browser. Kopieer je code en
          plak hem op je telefoon of computer om hem daar ook te hebben.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <button type="button" onClick={exportCode} disabled={!ids.length} className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-40">
            Kopieer mijn code
          </button>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/60">Code plakken</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="data w-64 border-b border-rule bg-transparent py-1.5 outline-none focus:border-approach"
            />
          </label>
          <button type="button" onClick={importCode} disabled={!code.trim()} className="border border-ink px-4 py-2 text-sm disabled:opacity-40">
            Zet terug
          </button>
          {ids.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Je hele spotlog wissen? Dit kan niet ongedaan worden.")) setSeen([]);
              }}
              className="ml-auto text-sm text-ink/60 underline"
            >
              Spotlog wissen
            </button>
          )}
        </div>
        {message && <p className="mt-3 break-all text-sm" role="status">{message}</p>}
      </section>
    </div>
  );
}
