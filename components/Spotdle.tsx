"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/photos";
import {
  EMOJI,
  FAMILIES,
  MANUFACTURERS,
  MAX_GUESSES,
  Puzzle,
  ZOOM,
  familyInfo,
  markGuess,
  puzzleNumber,
  todayInAmsterdam,
} from "@/lib/spotdle";
import { SpotdleRecord, useSpotdleHistory } from "@/lib/storage";

const EMPTY: SpotdleRecord = { guesses: [], done: false, won: false, bonus: null };

// Klokjes als externe bron: geen setState in effects nodig.
const everySecond = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};

/** Tijd tot middernacht in Amsterdam, als "07:12:45". */
const untilMidnight = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const left = 86_400 - (get("hour") * 3600 + get("minute") * 60 + get("second"));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
};

export default function Spotdle({ puzzles }: { puzzles: Puzzle[] }) {
  const today = useSyncExternalStore(everySecond, todayInAmsterdam, () => null);
  const [history, setHistory] = useSpotdleHistory();
  const [practice, setPractice] = useState<{ n: number; rec: SpotdleRecord } | null>(null);
  const [shared, setShared] = useState(false);

  if (!today) {
    return <div className="aspect-[3/2] w-full animate-pulse bg-paper-2" aria-label="Spotdle laden" />;
  }

  const num = puzzleNumber(today);
  const daily = puzzles[(((num - 1) % puzzles.length) + puzzles.length) % puzzles.length];
  const puzzle = practice ? puzzles[practice.n] : daily;
  const rec = practice ? practice.rec : (history[num] ?? EMPTY);
  const misses = rec.guesses.filter((g) => g !== puzzle.family).length;

  const save = (next: SpotdleRecord) => {
    if (practice) setPractice({ ...practice, rec: next });
    else setHistory({ ...history, [num]: next });
  };

  const guess = (family: string) => {
    if (rec.done || rec.guesses.includes(family)) return;
    const guesses = [...rec.guesses, family];
    const won = family === puzzle.family;
    save({ ...rec, guesses, won, done: won || guesses.length >= MAX_GUESSES });
    setShared(false);
  };

  const answerBonus = (operator: string) => {
    if (rec.bonus !== null) return;
    save({ ...rec, bonus: operator === puzzle.operator });
  };

  const scale = rec.done ? 1 : ZOOM[Math.min(misses, ZOOM.length - 1)];
  const info = familyInfo(puzzle.family);

  const hints: { after: number; label: string; value: string }[] = [
    { after: 2, label: "Soort", value: CATEGORIES[puzzle.category] },
    { after: 3, label: "Motoren", value: String(info.engines) },
    { after: 4, label: "Gespot op", value: puzzle.date ?? "onbekend" },
    { after: 5, label: "Maatschappij begint met", value: puzzle.operator.charAt(0) },
  ];

  const shareText = () =>
    [
      `Spotdle${practice ? " (oefenronde)" : ` #${num}`} ✈ ${rec.won ? rec.guesses.length : "X"}/${MAX_GUESSES}${rec.bonus ? " ⭐" : ""}`,
      rec.guesses.map((g) => EMOJI[markGuess(g, puzzle.family)]).join(""),
      "planespotternederland.nl/spotdle",
    ].join("\n");

  const share = async () => {
    const text = shareText();
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
    } catch {
      // Delen geannuleerd: niets aan de hand.
    }
  };

  const bonusChoices = [puzzle.operator, ...puzzle.decoys].sort((a, b) => a.localeCompare(b));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="data text-sm text-ink/60">
            {practice ? "Oefenronde" : `#${num} · ${today}`}
          </p>
          <p className="data text-sm text-ink/60">
            poging {Math.min(rec.guesses.length + (rec.done ? 0 : 1), MAX_GUESSES)}/{MAX_GUESSES}
          </p>
        </div>

        {/* De foto: eerst ver ingezoomd op het toestel, elke misser zoomt uit. */}
        <div className="relative mt-2 aspect-[3/2] w-full overflow-hidden bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- neutrale URL, geen spoiler in de bestandsnaam */}
          <img
            key={puzzle.n}
            src={`/spotdle/foto/${puzzle.n}`}
            alt={rec.done ? `${puzzle.type} van ${puzzle.operator}` : "Raad het toestel"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${puzzle.focus[0]}% ${puzzle.focus[1]}%`,
            }}
          />
          {!rec.done && (
            <span className="data absolute bottom-2 right-2 bg-ink/80 px-2 py-0.5 text-xs text-paper">
              {scale.toFixed(1)}×
            </span>
          )}
        </div>

        <ol className="mt-4 grid gap-1.5" aria-label="Je pogingen">
          {Array.from({ length: MAX_GUESSES }, (_, i) => {
            const g = rec.guesses[i];
            const mark = g ? markGuess(g, puzzle.family) : null;
            return (
              <li
                key={i}
                className={`flex h-10 items-center gap-3 border px-3 text-sm ${
                  mark === "goed"
                    ? "border-approach bg-approach text-paper"
                    : mark === "fabrikant"
                      ? "border-plate bg-plate"
                      : mark === "fout"
                        ? "border-ink/20 bg-paper-2 text-ink/60 line-through"
                        : "border-rule"
                }`}
              >
                <span className="data w-5 text-ink/40">{i + 1}</span>
                {g ?? ""}
                {mark === "fabrikant" && <span className="ml-auto text-xs no-underline">goede fabrikant</span>}
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        {!rec.done ? (
          <>
            <h2 className="text-lg">Welk type is dit?</h2>
            <p className="mt-1 text-sm text-ink/70">
              Groen is goed, geel is de goede fabrikant. Elke misser zoomt verder uit.
            </p>
            {MANUFACTURERS.map((maker) => (
              <fieldset key={maker} className="mt-4">
                <legend className="text-sm text-ink/60">{maker}</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {FAMILIES.filter((f) => f.maker === maker).map((f) => {
                    const used = rec.guesses.includes(f.name);
                    return (
                      <button
                        key={f.name}
                        type="button"
                        disabled={used}
                        onClick={() => guess(f.name)}
                        className="data border border-ink px-2.5 py-1.5 text-sm hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule disabled:text-ink/30 disabled:hover:bg-transparent"
                      >
                        {f.name.replace(`${maker} `, "")}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {misses >= 2 && (
              <dl className="mt-6 border-t border-rule text-sm">
                {hints
                  .filter((h) => misses >= h.after)
                  .map((h) => (
                    <div key={h.label} className="flex justify-between gap-4 border-b border-rule py-2">
                      <dt className="text-ink/60">Hint · {h.label}</dt>
                      <dd className="data">{h.value}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl">
              {rec.won ? `Gespot in ${rec.guesses.length}!` : "Helaas, deze ontsnapte."}
            </h2>
            <p className="mt-2">
              {puzzle.registration && <span className="reg mr-2">{puzzle.registration}</span>}
              {puzzle.type} van {puzzle.operator}
              {puzzle.date && (
                <>
                  , gespot op <span className="data">{puzzle.date}</span>
                </>
              )}
              .
            </p>
            <p className="mt-2 text-sm">
              <Link href={`/log/${puzzle.id}`}>Bekijk deze entry in het log</Link>
            </p>

            <div className="mt-6 border-t border-rule pt-4">
              <h3 className="text-base">Bonus: welke maatschappij?</h3>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {bonusChoices.map((o) => {
                  const picked = rec.bonus !== null;
                  const right = o === puzzle.operator;
                  return (
                    <button
                      key={o}
                      type="button"
                      disabled={picked}
                      onClick={() => answerBonus(o)}
                      className={`border px-2.5 py-2 text-left text-sm ${
                        picked && right
                          ? "border-approach bg-approach text-paper"
                          : picked
                            ? "border-rule text-ink/40"
                            : "border-ink hover:bg-ink hover:text-paper"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {rec.bonus !== null && (
                <p className="mt-2 text-sm">{rec.bonus ? "⭐ Goed, bonusster verdiend." : "Mis, maar de foto is binnen."}</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={share} className="bg-ink px-4 py-2 text-sm text-paper hover:bg-approach">
                {shared ? "Gekopieerd, deel maar" : "Deel je score"}
              </button>
              <button
                type="button"
                onClick={() => setPractice({ n: Math.floor(Math.random() * puzzles.length), rec: EMPTY })}
                className="border border-ink px-4 py-2 text-sm hover:bg-paper-2"
              >
                Oefenronde
              </button>
              {practice && (
                <button type="button" onClick={() => setPractice(null)} className="text-sm text-approach underline">
                  Terug naar vandaag
                </button>
              )}
            </div>
            <pre className="data mt-4 whitespace-pre-wrap bg-paper-2 p-3 text-sm">{shareText()}</pre>
            {!practice && <Countdown />}
          </>
        )}

        {!practice && <Stats history={history} num={num} />}
      </div>
    </div>
  );
}

function Countdown() {
  const left = useSyncExternalStore(everySecond, untilMidnight, () => "--:--:--");
  return (
    <p className="mt-4 text-sm text-ink/70">
      Nieuwe foto over <span className="data">{left}</span>
    </p>
  );
}

function Stats({ history, num }: { history: Record<string, SpotdleRecord>; num: number }) {
  const done = Object.entries(history).filter(([, r]) => r.done);
  if (!done.length) return null;
  const wins = done.filter(([, r]) => r.won);
  const won = (n: number) => history[n]?.won === true;

  // Reeks: vandaag telt mee als hij al gewonnen is, anders tellen we vanaf gisteren.
  let streak = 0;
  for (let n = won(num) ? num : num - 1; won(n); n--) streak++;
  let best = 0;
  let run = 0;
  const nums = done.map(([k]) => Number(k));
  for (let n = Math.min(...nums); n <= Math.max(...nums); n++) {
    run = won(n) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const dist = Array.from({ length: MAX_GUESSES }, (_, i) => wins.filter(([, r]) => r.guesses.length === i + 1).length);
  const maxDist = Math.max(...dist, 1);

  return (
    <section className="mt-8 border-t border-ink pt-4" aria-labelledby="spotdle-stats">
      <h3 id="spotdle-stats" className="text-base">
        Jouw Spotdle
      </h3>
      <dl className="mt-3 grid grid-cols-4 gap-3 text-sm">
        {[
          ["Gespeeld", done.length],
          ["Gewonnen", `${Math.round((wins.length / done.length) * 100)}%`],
          ["Reeks", streak],
          ["Beste", best],
        ].map(([l, v]) => (
          <div key={l}>
            <dt className="text-ink/60">{l}</dt>
            <dd className="data text-lg">{v}</dd>
          </div>
        ))}
      </dl>
      <ol className="mt-4 space-y-1 text-sm" aria-label="Verdeling van je winsten">
        {dist.map((n, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="data w-3">{i + 1}</span>
            <span className="block h-4 rounded-r bg-approach" style={{ width: `${Math.max((n / maxDist) * 100, 3)}%` }} />
            <span className="data text-ink/70">{n}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
