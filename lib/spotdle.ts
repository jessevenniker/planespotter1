// Spotdle: elke dag één foto uit het log, eerst ver ingezoomd. Raad de
// typefamilie in zes pogingen. Pure functies, veilig voor de browser.

import type { Category, Entry } from "./photos";

export const MANUFACTURERS = ["Airbus", "Boeing", "Embraer"] as const;

/** De families waaruit je kiest, per fabrikant. */
export const FAMILIES: { name: string; maker: (typeof MANUFACTURERS)[number]; engines: number }[] = [
  { name: "Airbus A220", maker: "Airbus", engines: 2 },
  { name: "Airbus A300", maker: "Airbus", engines: 2 },
  { name: "Airbus A320-familie", maker: "Airbus", engines: 2 },
  { name: "Airbus A330", maker: "Airbus", engines: 2 },
  { name: "Airbus A340", maker: "Airbus", engines: 4 },
  { name: "Airbus A350", maker: "Airbus", engines: 2 },
  { name: "Airbus A380", maker: "Airbus", engines: 4 },
  { name: "Airbus BelugaXL", maker: "Airbus", engines: 2 },
  { name: "Boeing 737", maker: "Boeing", engines: 2 },
  { name: "Boeing 747", maker: "Boeing", engines: 4 },
  { name: "Boeing 757", maker: "Boeing", engines: 2 },
  { name: "Boeing 767", maker: "Boeing", engines: 2 },
  { name: "Boeing 777", maker: "Boeing", engines: 2 },
  { name: "Boeing 787", maker: "Boeing", engines: 2 },
  { name: "Embraer E-Jet", maker: "Embraer", engines: 2 },
];

/** Typefamilie van een entry, of null als hij niet in het spel past (zakenjets, onbekend). */
export const familyOf = (type: string): string | null => {
  const rules: [RegExp, string][] = [
    [/BelugaXL/, "Airbus BelugaXL"],
    [/A220/, "Airbus A220"],
    [/A300/, "Airbus A300"],
    [/A31[89]|A32[01]/, "Airbus A320-familie"],
    [/A330/, "Airbus A330"],
    [/A340/, "Airbus A340"],
    [/A350/, "Airbus A350"],
    [/A380/, "Airbus A380"],
    [/Boeing 737/, "Boeing 737"],
    [/Boeing 747/, "Boeing 747"],
    [/Boeing 757/, "Boeing 757"],
    [/Boeing 767/, "Boeing 767"],
    [/Boeing 777/, "Boeing 777"],
    [/Boeing 787/, "Boeing 787"],
    [/Embraer (E-Jet|E1\d\d|190|195)/, "Embraer E-Jet"],
  ];
  return rules.find(([re]) => re.test(type))?.[1] ?? null;
};

export const familyInfo = (name: string) => FAMILIES.find((f) => f.name === name)!;

/** Een puzzel: alles wat de browser nodig heeft, zonder de bestandsnaam van de foto. */
export type Puzzle = {
  /** Index in de vaste volgorde; ook de URL van de foto: /spotdle/foto/{n}. */
  n: number;
  id: string;
  family: string;
  type: string;
  registration: string | null;
  operator: string;
  category: Category;
  date: string | null;
  focus: [number, number];
  /** Drie andere maatschappijen voor de bonusvraag. */
  decoys: string[];
};

/** Dag 1 van Spotdle. */
export const LAUNCH = "2026-09-25";

/** Vaste pseudo-willekeur, zodat iedereen dezelfde volgorde krijgt. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * De puzzels in een vaste, geschudde volgorde. Alleen toestellen met een
 * maatschappij en een herkenbare typefamilie doen mee.
 */
export const buildPuzzles = (entries: Entry[], focus: Record<string, [number, number]>): Puzzle[] => {
  const eligible = entries
    .filter((e) => e.operator && familyOf(e.type))
    .sort((a, b) => a.id.localeCompare(b.id));
  const rand = mulberry32(20260925);
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }
  const operators = [...new Set(eligible.map((e) => e.operator!))].sort();
  return eligible.map((e, n) => {
    const others = operators.filter((o) => o !== e.operator);
    const decoys: string[] = [];
    while (decoys.length < 3 && others.length) {
      decoys.push(others.splice(Math.floor(rand() * others.length), 1)[0]);
    }
    return {
      n,
      id: e.id,
      family: familyOf(e.type)!,
      type: e.type,
      registration: e.registration,
      operator: e.operator!,
      category: e.category,
      date: e.spottedAt?.slice(0, 10) ?? null,
      focus: focus[e.id] ?? [50, 50],
      decoys,
    };
  });
};

/** Vandaag in Amsterdam, als "2026-09-25". */
export const todayInAmsterdam = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());

/** Puzzelnummer voor een datum: 25 september 2026 is nummer 1. */
export const puzzleNumber = (day: string) =>
  Math.round((Date.UTC(...ymd(day)) - Date.UTC(...ymd(LAUNCH))) / 86_400_000) + 1;

const ymd = (d: string): [number, number, number] => {
  const [y, m, dd] = d.split("-").map(Number);
  return [y, m - 1, dd];
};

export const MAX_GUESSES = 6;

/** Hoe ver ingezoomd, per aantal gemiste pogingen. Na afloop de hele foto. */
export const ZOOM = [3.2, 2.5, 1.95, 1.55, 1.3, 1.1];

export type Mark = "goed" | "fabrikant" | "fout";

export const markGuess = (guess: string, answer: string): Mark =>
  guess === answer ? "goed" : familyInfo(guess).maker === familyInfo(answer).maker ? "fabrikant" : "fout";

export const EMOJI: Record<Mark, string> = { goed: "🟩", fabrikant: "🟨", fout: "⬛" };
