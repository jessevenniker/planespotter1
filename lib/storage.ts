"use client";

import { useCallback, useSyncExternalStore } from "react";

// Kleine opslag in de browser voor Mijn spotlog en Spotdle. Er zijn geen
// accounts: alles blijft op het apparaat van de bezoeker. useSyncExternalStore
// houdt tabbladen en componenten gelijk, ook als een ander tabblad schrijft.

const EVENT = "dutchplanes-storage";

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
};

/**
 * Een JSON-waarde in localStorage. Op de server en tijdens de eerste render is
 * de waarde `fallback`, zodat de statische HTML voor iedereen gelijk is.
 */
export function useStored<T>(key: string, fallback: T): [T, (next: T) => void] {
  // De ruwe string is stabiel tussen renders; parsen gebeurt hieronder.
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  let value = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  const set = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Opslag vol of geblokkeerd: dan werkt het alleen voor deze sessie niet.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );
  return [value, set];
}

export const SPOTLOG_KEY = "dutchplanes-spotlog-v1";
export const SPOTDLE_KEY = "dutchplanes-spotdle-v1";

/** De ids van toestellen die de bezoeker zelf ook gezien heeft. */
export function useSpotlog() {
  const [seen, setSeen] = useStored<string[]>(SPOTLOG_KEY, []);
  const has = useCallback((id: string) => seen.includes(id), [seen]);
  const toggle = useCallback(
    (id: string) => setSeen(seen.includes(id) ? seen.filter((x) => x !== id) : [...seen, id]),
    [seen, setSeen]
  );
  return { seen, has, toggle, setSeen };
}

export type SpotdleRecord = { guesses: string[]; done: boolean; won: boolean; bonus: boolean | null };
export type SpotdleHistory = Record<string, SpotdleRecord>;

export function useSpotdleHistory() {
  return useStored<SpotdleHistory>(SPOTDLE_KEY, {});
}
