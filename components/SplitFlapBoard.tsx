"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type BoardRow = {
  id: string;
  time: string;
  date: string;
  reg: string | null;
  type: string;
  operator: string;
  /** Passagiers, vracht, zakenjet...: wisselt per regel, dus het bord leeft. */
  kind: string;
};

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:./";
const ROWS = 6;
const ROLL_MS = 6000;

const pad = (s: string, n: number) => s.toUpperCase().slice(0, n).padEnd(n, " ");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Eén regel tekst op het bord. Bij een nieuwe waarde rolt elk klepje door de
 * tekenset tot het juiste teken, met een kleine vertraging per positie. In de
 * HTML staat meteen de eindtekst, dus crawlers en screenreaders lezen gewoon mee.
 */
function Flaps({ text, width }: { text: string; width: number }) {
  const target = pad(text, width);
  const [shown, setShown] = useState(target);
  const [turns, setTurns] = useState<number[]>(() => Array(width).fill(0));
  const shownRef = useRef(target);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      // Zonder animatie meteen naar de eindtekst.
      const cur = (reduced ? target : shownRef.current).split("");
      let busy = false;
      const turned: number[] = [];
      for (let i = 0; i < width; i++) {
        if (tick < i * 0.6 || cur[i] === target[i]) continue;
        busy = true;
        const at = CHARSET.indexOf(cur[i]);
        cur[i] = CHARSET[(at + 1) % CHARSET.length];
        turned.push(i);
      }
      shownRef.current = cur.join("");
      setShown(shownRef.current);
      setTurns((t) => t.map((n, i) => (turned.includes(i) ? n + 1 : n)));
      if (!busy) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [target, width]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="whitespace-pre">
        {shown.split("").map((c, i) => (
          <span key={`${i}-${turns[i]}`} className="flap flap-turn">
            {c}
          </span>
        ))}
      </span>
    </>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("nl-NL", {
          timeZone: "Europe/Amsterdam",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return <span className="data">{now ?? "--:--"}</span>;
}

/**
 * Het vertrekbord bovenaan: de laatst gespotte toestellen, zoals op de borden in
 * de vertrekhal. Elke paar seconden schuift het bord één regel door.
 */
export default function SplitFlapBoard({ rows }: { rows: BoardRow[] }) {
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || rows.length <= ROWS || prefersReducedMotion()) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % rows.length), ROLL_MS);
    return () => clearInterval(t);
  }, [paused, rows.length]);

  const visible = Array.from({ length: Math.min(ROWS, rows.length) }, (_, i) =>
    rows[(offset + i) % rows.length]
  );

  return (
    <section
      aria-label="Laatst gespot"
      className="bg-ink text-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1240px] px-5 py-5">
        <div className="flex items-baseline justify-between gap-4 border-b border-paper/20 pb-3">
          <h2 className="text-lg">Laatst gespot</h2>
          <p className="whitespace-nowrap text-sm text-paper/70">
            Schiphol <Clock />
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="data mt-2 w-full border-collapse text-[0.8rem] sm:text-base">
            <caption className="sr-only">
              De laatst gespotte toestellen, met tijd, datum, registratie of type
              en maatschappij.
            </caption>
            <thead>
              <tr className="text-left text-xs text-paper/50">
                <th scope="col" className="py-1.5 pr-4 font-normal">Tijd</th>
                <th scope="col" className="hidden py-1.5 pr-4 font-normal sm:table-cell">Datum</th>
                <th scope="col" className="py-1.5 pr-4 font-normal">Toestel</th>
                <th scope="col" className="py-1.5 pr-4 font-normal">Maatschappij</th>
                <th scope="col" className="hidden py-1.5 font-normal md:table-cell">Soort</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <tr key={i} className="border-t border-paper/10">
                  <td className="py-1.5 pr-4">
                    <Flaps text={r.time} width={5} />
                  </td>
                  <td className="hidden py-1.5 pr-4 text-paper/70 sm:table-cell">
                    <Flaps text={r.date} width={10} />
                  </td>
                  <td className="py-1.5 pr-4">
                    <Link href={`/log/${r.id}`} className="text-plate no-underline">
                      <Flaps text={r.reg ?? r.type} width={11} />
                    </Link>
                  </td>
                  <td className="py-1.5 pr-4">
                    <Flaps text={r.operator} width={16} />
                  </td>
                  <td className="hidden py-1.5 text-plate md:table-cell">
                    <Flaps text={r.kind} width={10} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
