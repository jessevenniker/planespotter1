"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flaps } from "@/components/SplitFlapBoard";

type Arrival = {
  id: string;
  flight: string;
  airline: string | null;
  airlineCode: string | null;
  origin: string | null;
  originCity: string | null;
  scheduled: string | null;
  expected: string | null;
  landed: string | null;
  registration: string | null;
  typeName: string | null;
  family: string | null;
  cargo: boolean;
  status: string | null;
  logId: string | null;
};

type Payload = { configured: boolean; updated?: string; error?: string; arrivals: Arrival[] };

const STATUS: Record<string, string> = {
  SCH: "Gepland", AIR: "In de lucht", EXP: "Verwacht", FIR: "Boven NL", LND: "Geland",
  FIB: "Bagage", ARR: "Aangekomen", DIV: "Uitgeweken", CNX: "Geannuleerd", TOM: "Morgen",
};

/** Families waar spotters voor omrijden. */
const SPECIAL = ["Boeing 747", "Airbus A380", "Airbus A340", "Airbus A300", "Airbus BelugaXL", "Boeing 757", "Boeing 767"];
const HEAVY = ["Airbus A330", "Airbus A350", "Boeing 777", "Boeing 787", ...SPECIAL];

const hhmm = (iso: string | null) => (iso ? iso.slice(11, 16) : "");

const why = (a: Arrival) => {
  if (a.logId) return "In het log";
  if (a.family && SPECIAL.includes(a.family)) return a.family.replace(/^(Airbus|Boeing) /, "");
  if (a.cargo) return "Vracht";
  return null;
};

/**
 * Live aankomsten op Schiphol, als vertrekbord. Haalt elke minuut nieuwe data op.
 * Bijzondere toestellen (747, A380, vracht, of al in het log) krijgen een ster.
 */
export default function ArrivalsBoard() {
  const [data, setData] = useState<Payload | null>(null);
  const [filter, setFilter] = useState<"alles" | "bijzonder" | "heavy">("alles");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/aankomsten");
      setData(await res.json());
    } catch {
      setData({ configured: true, error: "Geen verbinding.", arrivals: [] });
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  if (!data) return <div className="h-64 animate-pulse bg-ink" aria-label="Aankomsten laden" />;
  if (!data.configured) {
    return (
      <p className="border-l-2 border-plate bg-paper-2 p-4 text-sm">
        De live aankomsten van Schiphol worden op dit moment gekoppeld. Kom straks
        terug, of bekijk zolang het <Link href="/">logboek</Link>.
      </p>
    );
  }

  const list = data.arrivals.filter((a) =>
    filter === "alles" ? true : filter === "heavy" ? a.family && HEAVY.includes(a.family) : why(a) !== null
  );
  const specials = data.arrivals.filter((a) => why(a) !== null).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex" role="group" aria-label="Filter">
          {(["alles", "heavy", "bijzonder"] as const).map((k, i) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={`border border-ink px-3 py-1.5 text-sm ${i ? "-ml-px" : ""} ${filter === k ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
            >
              {k === "alles" ? "Alles" : k === "heavy" ? "Widebodies" : `Bijzonder (${specials})`}
            </button>
          ))}
        </div>
        <p className="data text-sm text-ink/60">
          {data.error ?? (data.updated ? `bijgewerkt ${new Date(data.updated).toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" })}` : "")}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto bg-ink text-paper">
        <table className="data w-full border-collapse text-[0.8rem] sm:text-sm">
          <caption className="sr-only">Aankomende vluchten op Schiphol met tijd, vlucht, herkomst, toestel en registratie</caption>
          <thead>
            <tr className="text-left text-xs text-paper/50">
              <th scope="col" className="px-3 py-2 font-normal">Gepland</th>
              <th scope="col" className="px-3 py-2 font-normal">Verwacht</th>
              <th scope="col" className="px-3 py-2 font-normal">Vlucht</th>
              <th scope="col" className="hidden px-3 py-2 font-normal md:table-cell">Van</th>
              <th scope="col" className="px-3 py-2 font-normal">Toestel</th>
              <th scope="col" className="hidden px-3 py-2 font-normal sm:table-cell">Registratie</th>
              <th scope="col" className="hidden px-3 py-2 font-normal lg:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const reason = why(a);
              return (
                <tr key={a.id} className={`border-t border-paper/10 ${reason ? "bg-paper/5" : ""}`}>
                  <td className="px-3 py-1.5"><Flaps text={hhmm(a.scheduled)} width={5} /></td>
                  <td className="px-3 py-1.5 text-plate"><Flaps text={hhmm(a.landed ?? a.expected)} width={5} /></td>
                  <td className="px-3 py-1.5">
                    <Flaps text={a.flight} width={7} />
                    <span className="sr-only">{a.airline}</span>
                  </td>
                  <td className="hidden px-3 py-1.5 md:table-cell"><Flaps text={a.originCity ?? a.origin ?? ""} width={14} /></td>
                  <td className="px-3 py-1.5">
                    <Flaps text={(a.typeName ?? "").replace(/^(Airbus|Boeing|Embraer) /, "")} width={11} />
                    {reason && <span className="ml-2 bg-plate px-1 font-sans text-[0.7rem] text-ink" title={reason}>★ {reason}</span>}
                  </td>
                  <td className="hidden px-3 py-1.5 sm:table-cell">
                    {a.logId ? (
                      <Link href={`/log/${a.logId}`} className="text-plate">{a.registration}</Link>
                    ) : (
                      <Flaps text={a.registration ?? ""} width={7} />
                    )}
                  </td>
                  <td className="hidden px-3 py-1.5 text-paper/70 lg:table-cell">{a.status ? (STATUS[a.status] ?? a.status) : ""}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 font-sans text-paper/70">
                  {filter === "alles" ? "Geen aankomsten in dit tijdvak." : "Nu even niets bijzonders. Kijk over een uurtje nog eens."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
