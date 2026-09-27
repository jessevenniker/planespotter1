// Koppeling met de Schiphol Public Flight API (v4). Alleen server-side: client
// secret en token komen nooit in de browser. Inloggen gaat met OAuth 2.0
// (client credentials): met client id en secret halen we een Bearer-token op.

import "server-only";
import { familyOf } from "./spotdle";

const BASE = "https://api.schiphol.nl/public/public-flights/v4";

export const isConfigured = () =>
  Boolean(
    process.env.SCHIPHOL_CLIENT_ID && process.env.SCHIPHOL_CLIENT_SECRET && process.env.SCHIPHOL_TOKEN_URL
  );

let token: { value: string; expires: number } | null = null;

/** Een geldig token, hergebruikt tot een minuut voor het verloopt. */
async function bearer(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SCHIPHOL_CLIENT_ID!,
    client_secret: process.env.SCHIPHOL_CLIENT_SECRET!,
  });
  if (process.env.SCHIPHOL_SCOPE) body.set("scope", process.env.SCHIPHOL_SCOPE);
  const res = await fetch(process.env.SCHIPHOL_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token ophalen mislukt: ${res.status} ${await res.text().catch(() => "")}`);
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  token = { value: json.access_token, expires: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return token.value;
}

type Cache = { revalidate: number };

async function api<T>(path: string, cache: Cache): Promise<{ data: T; link: string | null }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${await bearer()}`, Accept: "application/json" },
    next: cache,
  });
  if (res.status === 204) return { data: {} as T, link: null };
  if (!res.ok) throw new Error(`Schiphol API ${path}: ${res.status} ${await res.text().catch(() => "")}`);
  return { data: (await res.json()) as T, link: res.headers.get("link") };
}

// Ruwe vorm van een vlucht zoals de API hem teruggeeft; alles optioneel, zodat
// een ontbrekend veld de pagina niet breekt.
type RawFlight = {
  id?: string;
  flightName?: string;
  mainFlight?: string;
  prefixIATA?: string;
  prefixICAO?: string;
  serviceType?: string;
  scheduleDateTime?: string;
  estimatedLandingTime?: string;
  actualLandingTime?: string;
  aircraftRegistration?: string;
  aircraftType?: { iataMain?: string; iataSub?: string };
  route?: { destinations?: string[] };
  publicFlightState?: { flightStates?: string[] };
  gate?: string;
  pier?: string;
  terminal?: number;
};

export type Arrival = {
  id: string;
  flight: string;
  airlineCode: string | null;
  airline: string | null;
  origin: string | null;
  originCity: string | null;
  scheduled: string | null;
  expected: string | null;
  landed: string | null;
  registration: string | null;
  typeCode: string | null;
  typeName: string | null;
  family: string | null;
  cargo: boolean;
  status: string | null;
  terminal: number | null;
  gate: string | null;
};

/** Veelvoorkomende IATA-typecodes op Schiphol. Onbekende codes vragen we op bij de API. */
const TYPES: Record<string, string> = {
  "319": "Airbus A319", "320": "Airbus A320", "321": "Airbus A321", "32A": "Airbus A320", "32B": "Airbus A321",
  "32N": "Airbus A320neo", "32Q": "Airbus A321neo", "221": "Airbus A220-100", "223": "Airbus A220-300",
  "332": "Airbus A330-200", "333": "Airbus A330-300", "339": "Airbus A330-900", "33X": "Airbus A330-200F",
  "342": "Airbus A340-200", "343": "Airbus A340-300", "346": "Airbus A340-600",
  "359": "Airbus A350-900", "351": "Airbus A350-1000", "388": "Airbus A380-800",
  "AB6": "Airbus A300-600", "ABY": "Airbus A300-600F",
  "73G": "Boeing 737-700", "73W": "Boeing 737-700", "738": "Boeing 737-800", "73H": "Boeing 737-800",
  "739": "Boeing 737-900", "73J": "Boeing 737-900", "7M8": "Boeing 737 MAX 8", "7M9": "Boeing 737 MAX 9",
  "744": "Boeing 747-400", "74Y": "Boeing 747-400F", "748": "Boeing 747-8", "74N": "Boeing 747-8F",
  "752": "Boeing 757-200", "75W": "Boeing 757-200", "763": "Boeing 767-300", "76W": "Boeing 767-300ER",
  "76Y": "Boeing 767-300F", "764": "Boeing 767-400ER", "772": "Boeing 777-200", "77L": "Boeing 777-200LR",
  "773": "Boeing 777-300", "77W": "Boeing 777-300ER", "77X": "Boeing 777F", "788": "Boeing 787-8",
  "789": "Boeing 787-9", "781": "Boeing 787-10",
  "E75": "Embraer 175", "E7W": "Embraer 175", "E90": "Embraer 190", "E95": "Embraer 195",
  "290": "Embraer E190-E2", "295": "Embraer E195-E2",
  "CR9": "Bombardier CRJ900", "DH4": "De Havilland Dash 8-400", "AT7": "ATR 72", "AT5": "ATR 42",
};

async function typeName(main?: string, sub?: string): Promise<string | null> {
  const code = sub || main;
  if (!code) return null;
  if (TYPES[code]) return TYPES[code];
  try {
    const q = new URLSearchParams({ ...(main ? { iataMain: main } : {}), ...(sub ? { iataSub: sub } : {}) });
    const { data } = await api<{ aircraftTypes?: { longDescription?: string }[] }>(`/aircrafttypes?${q}`, { revalidate: 604_800 });
    const long = data.aircraftTypes?.[0]?.longDescription;
    // "BOEING 787-9" → "Boeing 787-9"
    return long ? long.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : code;
  } catch {
    return code;
  }
}

const names = new Map<string, Promise<string | null>>();
const lookup = (key: string, load: () => Promise<string | null>) => {
  if (!names.has(key)) names.set(key, load().catch(() => null));
  return names.get(key)!;
};

const airlineName = (code: string) =>
  lookup(`a:${code}`, async () => {
    const { data } = await api<{ publicName?: string }>(`/airlines/${code}`, { revalidate: 604_800 });
    return data.publicName ?? null;
  });

const cityOf = (iata: string) =>
  lookup(`d:${iata}`, async () => {
    const { data } = await api<{ city?: string; publicName?: { dutch?: string; english?: string } }>(
      `/destinations/${iata}`,
      { revalidate: 604_800 }
    );
    return data.city ?? data.publicName?.dutch ?? data.publicName?.english ?? null;
  });

/** "2026-09-27T12:30:00" in Amsterdamse tijd, zoals de API hem wil. */
const localStamp = (d: Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .format(d)
    .replace(" ", "T");

/**
 * Aankomsten van een half uur geleden tot een paar uur vooruit. Alleen de
 * hoofdvlucht, dus geen dubbele regels voor codeshares.
 */
export async function arrivals({ hoursAhead = 3, maxPages = 5 } = {}): Promise<Arrival[]> {
  const now = Date.now();
  const params = new URLSearchParams({
    flightDirection: "A",
    includedelays: "false",
    fromDateTime: localStamp(new Date(now - 30 * 60_000)),
    toDateTime: localStamp(new Date(now + hoursAhead * 3_600_000)),
    searchDateTimeField: "scheduleDateTime",
    sort: "+scheduleDateTime",
  });

  const raw: RawFlight[] = [];
  for (let page = 0; page < maxPages; page++) {
    params.set("page", String(page));
    const { data, link } = await api<{ flights?: RawFlight[] }>(`/flights?${params}`, { revalidate: 60 });
    raw.push(...(data.flights ?? []));
    if (!link?.includes('rel="next"')) break;
  }

  const main = raw.filter((f) => !f.mainFlight || f.mainFlight === f.flightName);
  return Promise.all(
    main.map(async (f): Promise<Arrival> => {
      const name = await typeName(f.aircraftType?.iataMain, f.aircraftType?.iataSub);
      const origin = f.route?.destinations?.[0] ?? null;
      return {
        id: f.id ?? `${f.flightName}-${f.scheduleDateTime}`,
        flight: f.flightName ?? "",
        airlineCode: f.prefixIATA ?? null,
        airline: f.prefixIATA ? await airlineName(f.prefixIATA) : null,
        origin,
        originCity: origin ? await cityOf(origin) : null,
        scheduled: f.scheduleDateTime ?? null,
        expected: f.estimatedLandingTime ?? null,
        landed: f.actualLandingTime ?? null,
        registration: f.aircraftRegistration ? normaliseReg(f.aircraftRegistration) : null,
        typeCode: f.aircraftType?.iataSub ?? f.aircraftType?.iataMain ?? null,
        typeName: name,
        family: name ? familyOf(name) : null,
        cargo: f.serviceType === "F" || f.serviceType === "H",
        status: f.publicFlightState?.flightStates?.[0] ?? null,
        terminal: f.terminal ?? null,
        gate: f.gate ?? null,
      };
    })
  );
}

/** De API geeft registraties zonder streepje ("PHBHN"). Zet het er weer in waar dat kan. */
export const normaliseReg = (r: string) => {
  const s = r.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^N\d/.test(s) || /^(JA|HL)\d/.test(s)) return s;
  const two = ["PH", "EI", "EC", "HB", "OE", "SE", "LX", "OO", "9H", "A6", "A7", "9V", "VN", "TC", "YL", "LN", "SU", "HZ", "PK", "VT", "XA", "CC", "4K", "TF", "OH", "HS", "OY", "SX", "CS", "LY", "ES", "UR", "SP", "OK", "HA", "YR", "LZ", "EP", "JY", "ET", "5Y", "ZS", "9M", "RP", "VH", "ZK", "CN", "TS", "4X", "A4", "AP", "VP", "VQ", "EW", "UK", "EX", "EK", "4L", "9K", "A9"];
  const p2 = s.slice(0, 2);
  if (two.includes(p2)) return `${p2}-${s.slice(2)}`;
  if (/^[BCDFGIT]/.test(s)) return `${s[0]}-${s.slice(1)}`;
  return s;
};

/** Statuscodes uit de documentatie van Schiphol, in het Nederlands. */
export const STATUS: Record<string, string> = {
  SCH: "Gepland",
  AIR: "In de lucht",
  EXP: "Verwacht",
  FIR: "Boven NL",
  LND: "Geland",
  FIB: "Bagage komt",
  ARR: "Aangekomen",
  DIV: "Uitgeweken",
  CNX: "Geannuleerd",
  TOM: "Morgen",
};
