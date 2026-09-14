// De enige bron van waarheid voor de site. Elke entry is een logboekregel.
//
// LET OP: de velden met TODO zijn nog niet ingevuld. Registratie, datum en baan
// zijn niet uit een foto af te lezen. Zolang die ontbreken toont de pagina het
// type in plaats van de registratie, blijft de entry uit de sitemap en staat
// hij niet te koop. Vul ze aan en alles verschijnt vanzelf.

export type Entry = {
  /** URL-slug. Stabiel: verander deze niet meer na publicatie. */
  id: string;
  /** Registratie. null zolang onbekend. */
  registration: string | null;
  type: string;
  typeShort: string;
  typeSlug: string;
  operator: string;
  /** Baanaanduiding zoals op Schiphol: 18R, 18C, 06, 09. null zolang onbekend. */
  runway: string | null;
  /** ISO 8601, lokale tijd Schiphol. null zolang onbekend. */
  spottedAt: string | null;
  location: string | null;
  /** Vrije observatie van de fotograaf. Beschrijvend, niet verkopend. */
  note: string;
  image: {
    src: string;
    width: number;
    height: number;
    /** Afmetingen van het origineel. Bepaalt welke printformaten kunnen. */
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

export const entries: Entry[] = [
  {
    id: "icelandair-boeing-737-max-8",
    registration: null, // TODO
    type: "Boeing 737 MAX 8",
    typeShort: "737 MAX 8",
    typeSlug: "boeing-737-max-8",
    operator: "Icelandair",
    runway: null, // TODO, de taxibaanborden wijzen richting Polderbaan
    spottedAt: null, // TODO
    location: null, // TODO
    note: "Rotatie met het neuswiel net los van de baan. Op de achtergrond een wachtend KLM-toestel, vervormd door de hittetrilling boven het asfalt.",
    image: {
      src: "/photos/icelandair-boeing-737-max-8.jpg",
      width: 1092,
      height: 1092,
      fullWidth: 1092,
      fullHeight: 1092,
      fileSizeMb: 0.1,
    },
    forSale: false,
  },
  {
    id: "ryanair-boeing-737-800",
    registration: null, // TODO
    type: "Boeing 737-800",
    typeShort: "737-800",
    typeSlug: "boeing-737-800",
    operator: "Ryanair",
    runway: null, // TODO, zelfde plek als de Icelandair
    spottedAt: null, // TODO
    location: null, // TODO
    note: "Vlak na het loskomen, landingsgestel nog uit. De hittetrilling boven de baan maakt van de toestellen erachter gekleurde vlekken.",
    image: {
      src: "/photos/ryanair-boeing-737-800.jpg",
      width: 1092,
      height: 1092,
      fullWidth: 1092,
      fullHeight: 1092,
      fileSizeMb: 0.09,
    },
    forSale: false,
  },
  {
    id: "klm-airbus-a330-landing",
    registration: null, // TODO
    type: "Airbus A330",
    typeShort: "A330",
    typeSlug: "airbus-a330",
    operator: "KLM",
    runway: null, // TODO, de skyline op de achtergrond wijst richting Buitenveldertbaan
    spottedAt: null, // TODO
    location: null, // TODO
    note: "Recht van voren op een natte baan, met opspattend water onder het gestel en de skyline van Amstelveen erachter.",
    image: {
      src: "/photos/klm-airbus-a330-landing.jpg",
      width: 1372,
      height: 896,
      fullWidth: 1372,
      fullHeight: 896,
      fileSizeMb: 0.08,
    },
    forSale: false,
  },
  {
    id: "klm-airbus-a330-start",
    registration: null, // TODO
    type: "Airbus A330",
    typeShort: "A330",
    typeSlug: "airbus-a330",
    operator: "KLM",
    runway: null, // TODO
    spottedAt: null, // TODO
    location: null, // TODO
    note: "Klimmend van onderaf gefotografeerd, gestel halverwege het intrekken. Rechts in beeld de rood-witte radiomast.",
    image: {
      src: "/photos/klm-airbus-a330-start.jpg",
      width: 1372,
      height: 896,
      fullWidth: 1372,
      fullHeight: 896,
      fileSizeMb: 0.11,
    },
    forSale: false,
  },
  {
    id: "widebody-onbekend-landing",
    registration: null, // TODO
    type: "Widebody, type nog te bevestigen", // TODO
    typeShort: "onbekend",
    typeSlug: "nog-te-bepalen",
    operator: "Nog te bevestigen", // TODO
    runway: null, // TODO
    spottedAt: null, // TODO
    location: null, // TODO
    note: "Landing op een natte baan, met een wolk opspattend water over de volle breedte. Wit toestel met een rood staartmerk.",
    image: {
      src: "/photos/widebody-onbekend-landing.jpg",
      width: 1400,
      height: 868,
      fullWidth: 1400,
      fullHeight: 868,
      fileSizeMb: 0.13,
    },
    forSale: false,
  },
];

/** Een entry is compleet zodra registratie, baan en datum ingevuld zijn. */
export const isComplete = (e: Entry) =>
  Boolean(e.registration && e.runway && e.spottedAt);

/** Alleen complete entries komen in de sitemap en in de structured data. */
export const publishedEntries = () => entries.filter(isComplete);

export const byDateDesc = (a: Entry, b: Entry) =>
  (b.spottedAt ?? "").localeCompare(a.spottedAt ?? "");

export const sortedEntries = () => [...entries].sort(byDateDesc);

export const getEntry = (id: string) =>
  entries.find((e) => e.id === id.toLowerCase());

export const entriesByRunway = (runway: string) =>
  sortedEntries().filter((e) => e.runway === runway);

export const entriesByType = (typeSlug: string) =>
  sortedEntries().filter((e) => e.typeSlug === typeSlug);

export const allTypeSlugs = () =>
  [...new Set(entries.filter(isComplete).map((e) => e.typeSlug))];

export const allRunways = () =>
  [...new Set(entries.map((e) => e.runway).filter(Boolean))] as string[];

/** Wat er in de gele plaat staat: registratie als die er is, anders het type. */
export const displayId = (e: Entry) => e.registration ?? e.typeShort;

/** Alt-tekst wordt opgebouwd uit de data, nooit handmatig geschreven. */
export const altText = (e: Entry) => {
  const parts = [`${e.type} van ${e.operator}`];
  if (e.registration) parts.push(`registratie ${e.registration}`);
  parts.push(
    e.runway
      ? `gefotografeerd bij de ${RUNWAYS[e.runway].name} op Schiphol`
      : "gefotografeerd op Schiphol"
  );
  return parts.join(", ");
};

/**
 * Welke printformaten haalbaar zijn bij deze resolutie. Bij 300 dpi heb je voor
 * 30 × 40 cm al 3543 px aan de lange zijde nodig. WhatsApp-bestanden halen dat
 * bij lange na niet, vandaar deze controle.
 */
export const availableSizes = (e: Entry) =>
  PRINT_SIZES.filter(
    (s) => Math.max(e.image.fullWidth, e.image.fullHeight) >= s.minPx
  );

export const formatDate = (iso: string | null) =>
  iso?.slice(0, 10) ?? "onbekend";

export const formatTime = (iso: string | null) =>
  iso?.slice(11, 16) ?? "onbekend";
