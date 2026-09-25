// Queries op het logboek. Alleen voor server components: dit importeert alle data.

import { entries } from "./entries";
import {
  Entry,
  dayKey,
  isComplete,
  operatorSlug,
  specialReason,
} from "./photos";

export { entries };

export const byDateDesc = (a: Entry, b: Entry) =>
  (b.spottedAt ?? "").localeCompare(a.spottedAt ?? "");

export const sortedEntries = () => [...entries].sort(byDateDesc);

/** Alleen complete entries komen in de sitemap en in de structured data. */
export const publishedEntries = () => sortedEntries().filter(isComplete);

export const getEntry = (id: string) =>
  entries.find((e) => e.id === id.toLowerCase());

export const entriesByRunway = (runway: string) =>
  sortedEntries().filter((e) => e.runway === runway);

export const entriesByType = (typeSlug: string) =>
  sortedEntries().filter((e) => e.typeSlug === typeSlug);

export const allTypeSlugs = () => [
  ...new Set(entries.filter(isComplete).map((e) => e.typeSlug)),
];

/** De buren in het log: nieuwer staat erboven, ouder eronder. */
export const neighbours = (id: string) => {
  const list = sortedEntries();
  const i = list.findIndex((e) => e.id === id);
  return {
    newer: i > 0 ? list[i - 1] : null,
    older: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
    position: i + 1,
    total: list.length,
  };
};

export type Day = { key: string; entries: Entry[] };

/** Spotdagen, nieuwste eerst. Entries zonder datum horen bij geen dag. */
export const days = (): Day[] => {
  const map = new Map<string, Entry[]>();
  for (const e of sortedEntries()) {
    const k = dayKey(e);
    if (!k) continue;
    map.set(k, [...(map.get(k) ?? []), e]);
  }
  return [...map].map(([key, list]) => ({
    key,
    // Binnen een dag in de volgorde waarin ze gespot zijn.
    entries: [...list].reverse(),
  }));
};

export const getDay = (key: string) => days().find((d) => d.key === key);

export type Operator = { slug: string; name: string; entries: Entry[] };

/** Maatschappijen, meest gespot eerst. */
export const operators = (): Operator[] => {
  const map = new Map<string, Operator>();
  for (const e of sortedEntries()) {
    const slug = operatorSlug(e);
    if (!slug || !e.operator) continue;
    const op = map.get(slug) ?? { slug, name: e.operator, entries: [] };
    op.entries.push(e);
    map.set(slug, op);
  }
  return [...map.values()].sort(
    (a, b) => b.entries.length - a.entries.length || a.name.localeCompare(b.name)
  );
};

export const getOperator = (slug: string) =>
  operators().find((o) => o.slug === slug);

export const specialEntries = () =>
  sortedEntries().filter((e) => specialReason(e) !== null);

/** Kerncijfers voor de strip bovenaan en de statistiekenpagina. */
export const stats = () => {
  const all = sortedEntries();
  const dated = all.filter((e) => e.spottedAt);
  const withCamera = all.filter((e) => e.camera);
  const shutterSeconds = (s: string) => {
    const [a, b] = s.split("/").map(Number);
    return b ? a / b : a;
  };
  const byFocal = [...withCamera].sort((a, b) => b.camera!.focalMm - a.camera!.focalMm);
  const byShutter = [...withCamera].sort(
    (a, b) => shutterSeconds(a.camera!.shutter) - shutterSeconds(b.camera!.shutter)
  );
  const byIso = withCamera
    .filter((e) => e.camera!.iso)
    .sort((a, b) => b.camera!.iso! - a.camera!.iso!);
  const bySun = all
    .filter((e) => e.sunAltitude !== null)
    .sort((a, b) => a.sunAltitude! - b.sunAltitude!);
  const dayList = days();
  const busiest = [...dayList].sort((a, b) => b.entries.length - a.entries.length)[0];

  return {
    total: all.length,
    days: dayList.length,
    operators: operators().length,
    types: new Set(all.map((e) => e.type)).size,
    registrations: all.filter((e) => e.registration).length,
    first: dated[dated.length - 1] ?? null,
    last: dated[0] ?? null,
    busiest,
    longestLens: byFocal[0] ?? null,
    fastestShutter: byShutter[0] ?? null,
    highestIso: byIso[0] ?? null,
    darkest: bySun[0] ?? null,
  };
};
