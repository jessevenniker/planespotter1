// Types, vaste gegevens en pure hulpfuncties. Bevat geen data, zodat client
// components dit kunnen importeren zonder het hele logboek mee te sturen. De
// entries zelf staan in lib/entries.ts, de queries daarop in lib/log.ts.

export type Category =
  | "passagiers"
  | "vracht"
  | "zakenjet"
  | "militair"
  | "helikopter";

export type Camera = {
  body: string;
  lens: string | null;
  focalMm: number;
  /** Sluitertijd zoals op de camera: "1/1000". */
  shutter: string;
  aperture: number;
  iso: number | null;
};

export type Entry = {
  /** URL-slug. Stabiel: verander deze niet meer na publicatie. */
  id: string;
  /** Registratie. null zolang onbekend. */
  registration: string | null;
  type: string;
  typeShort: string;
  typeSlug: string;
  /** Maatschappij. null zolang onbekend. */
  operator: string | null;
  category: Category;
  /** Baanaanduiding zoals op Schiphol: 18R, 18C, 06, 09. null zolang onbekend. */
  runway: string | null;
  /** ISO 8601, lokale opnametijd uit de EXIF van de camera. null zolang onbekend. */
  spottedAt: string | null;
  location: string | null;
  /** Vrije observatie van de fotograaf. Beschrijvend, niet verkopend. */
  note: string | null;
  /** Een type dat je niet elke dag op Schiphol ziet. */
  rare: boolean;
  /** Camera-instellingen uit de EXIF. null als het bestand geen EXIF had. */
  camera: Camera | null;
  /** Zonnehoogte in graden op het moment van de foto, berekend voor Schiphol. */
  sunAltitude: number | null;
  image: {
    src: string;
    width: number;
    height: number;
    /** Afmetingen en grootte van het origineel. Bepaalt welke printformaten kunnen. */
    fullWidth: number;
    fullHeight: number;
    fileSizeMb: number;
  };
  /** Zet op false zolang het origineel te klein is voor print. */
  forSale: boolean;
};

export const PRINT_SIZES = [
  { id: "30x40", label: "30 × 40 cm", priceEur: 39, minPx: 3543 },
  { id: "50x70", label: "50 × 70 cm", priceEur: 69, minPx: 5906 },
  { id: "70x100", label: "70 × 100 cm", priceEur: 119, minPx: 8268 },
] as const;

export const DOWNLOAD_PRICE_EUR = 12;

export const RUNWAYS: Record<string, { name: string; description: string }> = {
  "18R": {
    name: "Polderbaan",
    description:
      "De meest gebruikte baan van Schiphol en de bekendste spotplek van Nederland, aan het einde van de IJweg.",
  },
  "18C": {
    name: "Zwanenburgbaan",
    description:
      "Loopt parallel aan de Polderbaan en wordt vooral bij drukte en bij noordenwind ingezet.",
  },
  "06": {
    name: "Kaagbaan",
    description:
      "Wordt veel gebruikt voor starts richting het zuidwesten, met zicht vanaf de Aalsmeerderdijk.",
  },
  "09": {
    name: "Buitenveldertbaan",
    description:
      "Bij oostenwind in gebruik, te zien vanaf de spotplek bij de parkeerplaats aan de Schipholweg.",
  },
};

export const CATEGORIES: Record<Category, string> = {
  passagiers: "Passagiers",
  vracht: "Vracht",
  zakenjet: "Zakenjet",
  militair: "Militair",
  helikopter: "Helikopter",
};

/** Een entry is compleet zodra registratie, baan en datum ingevuld zijn. */
export const isComplete = (e: Entry) =>
  Boolean(e.registration && e.runway && e.spottedAt);

/** Wat er in de gele plaat staat: registratie als die er is, anders het type. */
export const displayId = (e: Entry) => e.registration ?? e.typeShort;

/** "Boeing 737-800 van Ryanair", of alleen het type zolang de maatschappij onbekend is. */
export const typeEnMaatschappij = (e: Entry) =>
  e.operator ? `${e.type} van ${e.operator}` : e.type;

/** Alt-tekst wordt opgebouwd uit de data, nooit handmatig geschreven. */
export const altText = (e: Entry) => {
  const parts = [typeEnMaatschappij(e)];
  if (e.registration) parts.push(`registratie ${e.registration}`);
  if (e.runway) {
    parts.push(`gefotografeerd bij de ${RUNWAYS[e.runway].name} op Schiphol`);
  } else if (e.location) {
    parts.push(`gefotografeerd op ${e.location}`);
  }
  return parts.join(", ");
};

/**
 * Welke printformaten haalbaar zijn bij deze resolutie. Bij 300 dpi heb je voor
 * 30 × 40 cm al 3543 px aan de lange zijde nodig.
 */
export const availableSizes = (e: Entry) =>
  PRINT_SIZES.filter(
    (s) => Math.max(e.image.fullWidth, e.image.fullHeight) >= s.minPx
  );

// Onbekende waarden worden niet getoond: de pagina laat alleen zien wat vastligt.
export const formatDate = (iso: string | null) => iso?.slice(0, 10) ?? null;

export const formatTime = (iso: string | null) => iso?.slice(11, 16) ?? null;

/** Datum en tijd samen, of null als er niets bekend is. */
export const formatSpotted = (iso: string | null) =>
  iso ? `${iso.slice(0, 10)} ${iso.slice(11, 16)}` : null;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const operatorSlug = (e: Entry) =>
  e.operator ? slugify(e.operator) : null;

/** "2026-09-20": de spotdag waar een entry bij hoort. */
export const dayKey = (e: Entry) => e.spottedAt?.slice(0, 10) ?? null;

const DAGEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

/** "zondag 20 september 2026". Rekent zonder tijdzone, dus server en browser zijn het eens. */
export const formatDayLong = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAGEN[weekday]} ${d} ${MAANDEN[m - 1]} ${y}`;
};

/** Eerste letter als hoofdletter, voor een datum aan het begin van een kop. */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "september 2026" voor een maandsleutel "2026-09". */
export const formatMonth = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${MAANDEN[m - 1]} ${y}`;
};

export type Light = { key: "dag" | "gouden-uur" | "blauwe-uur" | "donker"; label: string };

/** Het licht op het moment van de foto, afgeleid uit de zonnehoogte. */
export const lightOf = (sunAltitude: number | null): Light | null => {
  if (sunAltitude === null) return null;
  if (sunAltitude > 6) return { key: "dag", label: "Daglicht" };
  if (sunAltitude > -4) return { key: "gouden-uur", label: "Gouden uur" };
  if (sunAltitude > -6) return { key: "blauwe-uur", label: "Blauwe uur" };
  return { key: "donker", label: "Donker" };
};

/** Een speciale kleurstelling staat in de notitie, zoals "Peter Pan-livery". */
const hasSpecialLivery = (e: Entry) =>
  Boolean(e.note && /livery|belettering/i.test(e.note));

/** Waarom een entry in de collectie Bijzonder staat, of null als dat niet zo is. */
export const specialReason = (e: Entry): string | null => {
  if (e.category === "militair") return "Militair";
  if (e.category === "helikopter") return "Helikopter";
  if (e.rare) return "Bijzondere bezoeker";
  if (hasSpecialLivery(e)) return e.note;
  return null;
};

/** "1/1000 · f/14 · ISO 1000 · 600 mm", zoals in de zoeker van de camera. */
export const exposureLine = (c: Camera) =>
  [c.shutter, `f/${c.aperture}`, c.iso ? `ISO ${c.iso}` : null, `${c.focalMm} mm`]
    .filter(Boolean)
    .join(" · ");

/** Het deel van een entry dat de zoeker en het vertrekbord in de browser nodig hebben. */
export type ViewItem = Pick<
  Entry,
  "id" | "registration" | "type" | "typeShort" | "operator" | "category" | "spottedAt" | "camera" | "sunAltitude"
> & { image: Pick<Entry["image"], "src" | "width" | "height"> };

export const toViewItem = (e: Entry): ViewItem => ({
  id: e.id,
  registration: e.registration,
  type: e.type,
  typeShort: e.typeShort,
  operator: e.operator,
  category: e.category,
  spottedAt: e.spottedAt,
  camera: e.camera,
  sunAltitude: e.sunAltitude,
  image: { src: e.image.src, width: e.image.width, height: e.image.height },
});
