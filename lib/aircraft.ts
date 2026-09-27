// Achtergrondinformatie per vliegtuigfamilie: voor de typepagina's, de
// vergelijkingen en de blokken op de entrypagina's. Maten en gewichten zijn
// afgeronde fabrieksopgaven van Airbus, Boeing en Embraer; exacte waarden
// verschillen per uitvoering, motor en inrichting.

export type Variant = {
  name: string;
  /** Meters */
  length: number;
  span: number;
  height: number;
  /** Maximaal startgewicht in ton */
  mtow: number;
  /** Bereik in km */
  range: number;
  /** Gebruikelijk aantal stoelen, of laadvermogen in ton voor vrachtversies */
  seats?: string;
  payload?: number;
};

export type AircraftFamily = {
  slug: string;
  /** Zelfde naam als familyOf() teruggeeft, zodat log en info aan elkaar hangen. */
  family: string;
  name: string;
  nickname?: string;
  maker: "Airbus" | "Boeing" | "Embraer";
  firstFlight: number;
  inService: number;
  engines: number;
  engineTypes: string;
  body: "smalle romp" | "brede romp";
  intro: string;
  variants: Variant[];
  /** Index van de variant die in vergelijkingen de familie vertegenwoordigt. */
  main: number;
  spotting: string[];
  related: string[];
};

export const AIRCRAFT: AircraftFamily[] = [
  {
    slug: "boeing-737",
    family: "Boeing 737",
    name: "Boeing 737",
    maker: "Boeing",
    firstFlight: 1967,
    inService: 1968,
    engines: 2,
    engineTypes: "CFM56-7B (737 NG), CFM LEAP-1B (737 MAX)",
    body: "smalle romp",
    intro:
      "Het meest gebouwde straalverkeersvliegtuig ooit en het werkpaard van KLM en Transavia op Europese routes. Op Schiphol zie je vooral de 737-700, -800 en -900 uit de Next Generation-reeks en steeds vaker de 737 MAX.",
    variants: [
      { name: "737-700", length: 33.6, span: 35.8, height: 12.5, mtow: 70.1, range: 6370, seats: "126–149" },
      { name: "737-800", length: 39.5, span: 35.8, height: 12.5, mtow: 79.0, range: 5440, seats: "162–189" },
      { name: "737 MAX 8", length: 39.5, span: 35.9, height: 12.3, mtow: 82.2, range: 6570, seats: "162–189" },
      { name: "737 MAX 9", length: 42.2, span: 35.9, height: 12.3, mtow: 88.3, range: 6570, seats: "178–220" },
    ],
    main: 1,
    spotting: [
      "Motoren met een afgeplatte onderkant (737 NG), zodat ze onder de lage vleugel passen. Bij de MAX zijn ze ronder en hebben ze een gekartelde achterrand.",
      "Een puntige staartkegel achter het richtingsroer, waar de A320 een stompe heeft.",
      "Kort neuswiel: de 737 staat laag op de grond.",
      "Blended winglets bij de NG, gesplitste 'scimitar'-winglets die ook naar beneden steken bij de MAX.",
    ],
    related: ["airbus-a320-familie", "boeing-757"],
  },
  {
    slug: "boeing-747",
    family: "Boeing 747",
    name: "Boeing 747",
    nickname: "Jumbo Jet",
    maker: "Boeing",
    firstFlight: 1969,
    inService: 1970,
    engines: 4,
    engineTypes: "GE CF6-80C2, PW4000, RB211 (747-400); GEnx-2B (747-8)",
    body: "brede romp",
    intro:
      "De Jumbo Jet met zijn herkenbare bult. KLM vloog tot 2020 met passagiersversies; op Schiphol zie je hem nu vooral als vrachtvliegtuig, van onder meer KLM Cargo en Atlas Air.",
    variants: [
      { name: "747-400", length: 70.6, span: 64.4, height: 19.4, mtow: 396.9, range: 13450, seats: "416–524" },
      { name: "747-400F", length: 70.6, span: 64.4, height: 19.4, mtow: 396.9, range: 8230, payload: 113 },
      { name: "747-8F", length: 76.3, span: 68.4, height: 19.4, mtow: 447.7, range: 8130, payload: 137 },
    ],
    main: 0,
    spotting: [
      "Vier motoren en de bult van het bovendek: onmiskenbaar.",
      "De 747-400F heeft een korte bult en een neus die omhoog klapt om vracht te laden.",
      "De 747-400 heeft winglets; de 747-8 heeft geen winglets maar schuin afgesneden vleugeltippen en een langere bult.",
    ],
    related: ["airbus-a380", "boeing-777"],
  },
  {
    slug: "boeing-757",
    family: "Boeing 757",
    maker: "Boeing",
    name: "Boeing 757",
    firstFlight: 1982,
    inService: 1983,
    engines: 2,
    engineTypes: "Rolls-Royce RB211-535, Pratt & Whitney PW2000",
    body: "smalle romp",
    intro:
      "Lang, slank en krachtig: de 757 werd in 2004 uit productie genomen maar vliegt nog op lange smalle-romproutes. Op Schiphol vooral te zien bij Icelandair en vrachtmaatschappijen.",
    variants: [{ name: "757-200", length: 47.3, span: 38.1, height: 13.6, mtow: 115.7, range: 7250, seats: "200–239" }],
    main: 0,
    spotting: [
      "Een lange, dunne romp: spotters noemen hem het potlood.",
      "Hoge landingsgestellen en een neus die wat naar beneden wijst.",
      "Grote motoren voor een smalle romp; veel exemplaren hebben blended winglets.",
    ],
    related: ["airbus-a320-familie", "boeing-767"],
  },
  {
    slug: "boeing-767",
    family: "Boeing 767",
    maker: "Boeing",
    name: "Boeing 767",
    firstFlight: 1981,
    inService: 1982,
    engines: 2,
    engineTypes: "GE CF6-80C2, PW4000, RB211-524",
    body: "brede romp",
    intro:
      "Boeings eerste tweemotorige widebody, met een smalle brede romp en zeven stoelen naast elkaar. Op Schiphol zie je hem bij United en bij vrachtmaatschappijen.",
    variants: [{ name: "767-300ER", length: 54.9, span: 47.6, height: 15.8, mtow: 186.9, range: 11070, seats: "218–269" }],
    main: 0,
    spotting: [
      "Een widebody die slank oogt: de romp is merkbaar smaller dan die van een 777 of A330.",
      "Twee motoren en viertwielige hoofdlandingsgestellen.",
      "Veel 767's hebben opstaande winglets, zoals die van United.",
    ],
    related: ["airbus-a330", "boeing-757"],
  },
  {
    slug: "boeing-777",
    family: "Boeing 777",
    name: "Boeing 777",
    nickname: "Triple Seven",
    maker: "Boeing",
    firstFlight: 1994,
    inService: 1995,
    engines: 2,
    engineTypes: "GE90, PW4000 of Trent 800 (777-200ER); GE90-115B (777-300ER en 777F)",
    body: "brede romp",
    intro:
      "De grootste tweemotorige die je dagelijks op Schiphol ziet. KLM vliegt de 777-200ER en -300ER, en vrachtmaatschappijen als Qatar Cargo, Emirates SkyCargo en China Southern Cargo komen met de 777F.",
    variants: [
      { name: "777-200ER", length: 63.7, span: 60.9, height: 18.5, mtow: 297.6, range: 13080, seats: "301–368" },
      { name: "777-300ER", length: 73.9, span: 64.8, height: 18.5, mtow: 351.5, range: 13650, seats: "365–396" },
      { name: "777F", length: 63.7, span: 64.8, height: 18.6, mtow: 347.8, range: 9070, payload: 102 },
    ],
    main: 1,
    spotting: [
      "Zes wielen per hoofdlandingsgestel: het duidelijkste kenmerk.",
      "Enorme, ronde motoren; de GE90 van de 777-300ER is een van de grootste straalmotoren ooit.",
      "Een staartkegel die eindigt in een platte, mesvormige rand.",
      "De -300ER en de 777F hebben schuin afgesneden vleugeltippen, de -200ER niet.",
    ],
    related: ["airbus-a350", "boeing-787", "boeing-747"],
  },
  {
    slug: "boeing-787",
    family: "Boeing 787",
    name: "Boeing 787",
    nickname: "Dreamliner",
    maker: "Boeing",
    firstFlight: 2009,
    inService: 2011,
    engines: 2,
    engineTypes: "GE GEnx-1B of Rolls-Royce Trent 1000",
    body: "brede romp",
    intro:
      "Een romp van koolstofcomposiet, vleugels die zichtbaar doorbuigen in de lucht en zuinige motoren. KLM vliegt de 787-9 en 787-10 vanaf Schiphol, net als TUI, Air Canada, LATAM en vele anderen.",
    variants: [
      { name: "787-8", length: 56.7, span: 60.1, height: 16.9, mtow: 228.0, range: 13530, seats: "242–248" },
      { name: "787-9", length: 62.8, span: 60.1, height: 17.0, mtow: 254.0, range: 14010, seats: "290–296" },
      { name: "787-10", length: 68.3, span: 60.1, height: 17.0, mtow: 254.0, range: 11730, seats: "318–336" },
    ],
    main: 1,
    spotting: [
      "Vleugels die bij de start sierlijk omhoog buigen, met schuine tippen zonder winglets.",
      "Een gladde neus met vier cockpitramen.",
      "Gekartelde achterranden aan de motoren (chevrons), tegen het geluid.",
      "Viertwielige hoofdlandingsgestellen: zo onderscheid je hem van de 777.",
    ],
    related: ["airbus-a350", "boeing-777", "airbus-a330"],
  },
  {
    slug: "airbus-a220",
    family: "Airbus A220",
    name: "Airbus A220",
    maker: "Airbus",
    firstFlight: 2013,
    inService: 2016,
    engines: 2,
    engineTypes: "Pratt & Whitney PW1500G",
    body: "smalle romp",
    intro:
      "Begonnen als de Bombardier CSeries en sinds 2018 onderdeel van Airbus. Stil en zuinig; op Schiphol te zien bij onder meer Air France, Swiss en airBaltic.",
    variants: [
      { name: "A220-100", length: 35.0, span: 35.1, height: 11.5, mtow: 63.1, range: 6390, seats: "100–135" },
      { name: "A220-300", length: 38.7, span: 35.1, height: 11.5, mtow: 70.9, range: 6300, seats: "120–160" },
    ],
    main: 1,
    spotting: [
      "Grote motoren in verhouding tot de slanke romp.",
      "Grote cockpitramen en een spitse neus.",
      "Vleugeltippen zonder sharklets, licht opgebogen.",
    ],
    related: ["embraer-e-jet", "airbus-a320-familie"],
  },
  {
    slug: "airbus-a300",
    family: "Airbus A300",
    name: "Airbus A300",
    maker: "Airbus",
    firstFlight: 1972,
    inService: 1974,
    engines: 2,
    engineTypes: "GE CF6-80C2 of PW4000",
    body: "brede romp",
    intro:
      "Het eerste vliegtuig van Airbus en de eerste tweemotorige widebody ter wereld. Passagiersversies zijn vrijwel verdwenen; op Schiphol komt hij nog als vrachtvliegtuig, bijvoorbeeld van MNG Airlines.",
    variants: [{ name: "A300-600F", length: 54.1, span: 44.8, height: 16.5, mtow: 170.5, range: 4850, payload: 48 }],
    main: 0,
    spotting: [
      "Een korte, gedrongen widebody.",
      "Kleine vleugeltipfences in plaats van winglets.",
      "Bij vrachtversies een grote laaddeur links voor de vleugel.",
    ],
    related: ["airbus-a330", "boeing-767"],
  },
  {
    slug: "airbus-a320-familie",
    family: "Airbus A320-familie",
    name: "Airbus A320-familie",
    maker: "Airbus",
    firstFlight: 1987,
    inService: 1988,
    engines: 2,
    engineTypes: "CFM56 of IAE V2500 (ceo); CFM LEAP-1A of PW1100G (neo)",
    body: "smalle romp",
    intro:
      "A319, A320 en A321, in de klassieke ceo-versie en de zuinige neo. De grootste concurrent van de 737 en de meest verkochte vliegtuigfamilie van dit moment. Op Schiphol vliegen onder meer Transavia, easyJet, Lufthansa, Iberia en SAS ermee.",
    variants: [
      { name: "A319", length: 33.8, span: 35.8, height: 11.8, mtow: 75.5, range: 6900, seats: "124–156" },
      { name: "A320", length: 37.6, span: 35.8, height: 11.8, mtow: 78.0, range: 6150, seats: "150–180" },
      { name: "A320neo", length: 37.6, span: 35.8, height: 11.8, mtow: 79.0, range: 6300, seats: "150–194" },
      { name: "A321neo", length: 44.5, span: 35.8, height: 11.8, mtow: 97.0, range: 7400, seats: "180–244" },
    ],
    main: 2,
    spotting: [
      "Een ronde neus en een stompe staartkegel, waar de 737 een puntige heeft.",
      "Ronde motoren die ruim onder de vleugel hangen; bij de neo een stuk groter.",
      "Kleine wingtip fences bij oudere exemplaren, opstaande sharklets bij nieuwere.",
      "De A321 herken je aan twee paar deuren boven en vlak voor de vleugel.",
    ],
    related: ["boeing-737", "airbus-a220"],
  },
  {
    slug: "airbus-a330",
    family: "Airbus A330",
    name: "Airbus A330",
    maker: "Airbus",
    firstFlight: 1992,
    inService: 1993,
    engines: 2,
    engineTypes: "GE CF6, PW4000 of Trent 700 (ceo); Trent 7000 (A330neo)",
    body: "brede romp",
    intro:
      "De veelzijdige tweemotorige widebody van Airbus. KLM vliegt de A330-200 en -300; Delta komt met de nieuwe A330-900. Ook de tankers van de NAVO (A330 MRTT) en de BelugaXL zijn op de A330 gebaseerd.",
    variants: [
      { name: "A330-200", length: 58.8, span: 60.3, height: 17.4, mtow: 242.0, range: 13450, seats: "220–260" },
      { name: "A330-300", length: 63.7, span: 60.3, height: 16.8, mtow: 242.0, range: 11750, seats: "250–290" },
      { name: "A330-900", length: 63.7, span: 64.0, height: 16.8, mtow: 251.0, range: 13330, seats: "260–300" },
    ],
    main: 1,
    spotting: [
      "Schuin opstaande winglets aan de vleugeltippen; bij de A330neo een gebogen sharklet.",
      "Viertwielige hoofdlandingsgestellen en een neus die op die van de A320 lijkt.",
      "De A330neo heeft grotere Trent 7000-motoren.",
    ],
    related: ["boeing-787", "airbus-a350", "boeing-767"],
  },
  {
    slug: "airbus-a350",
    family: "Airbus A350",
    name: "Airbus A350",
    nickname: "XWB",
    maker: "Airbus",
    firstFlight: 2013,
    inService: 2015,
    engines: 2,
    engineTypes: "Rolls-Royce Trent XWB",
    body: "brede romp",
    intro:
      "Het antwoord van Airbus op de 787 en de 777. Op Schiphol zie je hem bij Finnair, Thai, China Southern, Vietnam Airlines, Etihad en World2fly.",
    variants: [
      { name: "A350-900", length: 66.8, span: 64.8, height: 17.1, mtow: 283.0, range: 15000, seats: "300–350" },
      { name: "A350-1000", length: 73.8, span: 64.8, height: 17.1, mtow: 319.0, range: 16100, seats: "350–410" },
    ],
    main: 0,
    spotting: [
      "Zwarte cockpitramen, het 'wasbeermasker'.",
      "Vleugeltippen die sierlijk omhoog krullen.",
      "Viertwielige hoofdlandingsgestellen bij de -900, zestwielige bij de -1000.",
    ],
    related: ["boeing-787", "boeing-777", "airbus-a330"],
  },
  {
    slug: "airbus-a380",
    family: "Airbus A380",
    name: "Airbus A380",
    nickname: "Superjumbo",
    maker: "Airbus",
    firstFlight: 2005,
    inService: 2007,
    engines: 4,
    engineTypes: "Rolls-Royce Trent 900 of Engine Alliance GP7200",
    body: "brede romp",
    intro:
      "Het grootste passagiersvliegtuig ter wereld, met twee volledige verdiepingen. Op Schiphol komt Emirates dagelijks met de A380.",
    variants: [{ name: "A380-800", length: 72.7, span: 79.8, height: 24.1, mtow: 575.0, range: 15000, seats: "500–615" }],
    main: 0,
    spotting: [
      "Twee volledige rijen ramen over de hele romp.",
      "Vier motoren en een enorme vleugel met kleine wingtip fences.",
      "Zestwielige hoofdlandingsgestellen onder de romp en vierwielige onder de vleugels.",
    ],
    related: ["boeing-747"],
  },
  {
    slug: "airbus-belugaxl",
    family: "Airbus BelugaXL",
    name: "Airbus BelugaXL",
    nickname: "Walvis",
    maker: "Airbus",
    firstFlight: 2018,
    inService: 2020,
    engines: 2,
    engineTypes: "Rolls-Royce Trent 700",
    body: "brede romp",
    intro:
      "Gebouwd op basis van de A330-200 om vliegtuigonderdelen tussen de fabrieken van Airbus te vervoeren. Er zijn er maar zes. Een bezoek aan Schiphol is zeldzaam en trekt altijd spotters.",
    variants: [{ name: "BelugaXL", length: 63.1, span: 60.3, height: 18.9, mtow: 227.0, range: 4000, payload: 51 }],
    main: 0,
    spotting: [
      "Een enorme bolle bovenromp met de cockpit laag ervoor.",
      "Beschilderd als een lachende beluga, met ogen bij de cockpit.",
      "Extra verticale vinnen aan de uiteinden van het stabilo.",
    ],
    related: ["airbus-a330"],
  },
  {
    slug: "embraer-e-jet",
    family: "Embraer E-Jet",
    name: "Embraer E-Jet",
    maker: "Embraer",
    firstFlight: 2002,
    inService: 2004,
    engines: 2,
    engineTypes: "GE CF34 (E1); Pratt & Whitney PW1900G (E2)",
    body: "smalle romp",
    intro:
      "De regionale jet uit Brazilië. KLM Cityhopper vliegt de E175, E190 en de nieuwe E195-E2 vanaf Schiphol naar bestemmingen in heel Europa; ook Helvetic en Air France Hop komen ermee.",
    variants: [
      { name: "E175", length: 31.7, span: 26.0, height: 9.7, mtow: 38.8, range: 3700, seats: "76–88" },
      { name: "E190", length: 36.2, span: 28.7, height: 10.6, mtow: 51.8, range: 4540, seats: "96–114" },
      { name: "E195-E2", length: 41.5, span: 35.1, height: 10.9, mtow: 62.5, range: 4800, seats: "120–146" },
    ],
    main: 2,
    spotting: [
      "Motoren dicht tegen de romp en laag bij de grond.",
      "Een 'dubbele bel'-romp met vier stoelen naast elkaar.",
      "De E2 heeft grotere motoren en langere, slankere vleugels met opgebogen tippen.",
    ],
    related: ["airbus-a220", "airbus-a320-familie"],
  },
];

export const getAircraft = (slug: string) => AIRCRAFT.find((a) => a.slug === slug);
export const aircraftForFamily = (family: string | null) =>
  family ? AIRCRAFT.find((a) => a.family === family) : undefined;

/** De variant die bij een exact type hoort ("Boeing 787-9" → 787-9), of de hoofdvariant. */
export const variantFor = (a: AircraftFamily, type: string): Variant =>
  [...a.variants].sort((x, y) => y.name.length - x.name.length).find((v) => type.includes(v.name)) ??
  a.variants[a.main];

/** Vaste vergelijkingen: de zoekvragen die spotters en reizigers echt stellen. */
export const COMPARISONS: [string, string][] = [
  ["boeing-787", "airbus-a350"],
  ["boeing-737", "airbus-a320-familie"],
  ["boeing-777", "airbus-a350"],
  ["airbus-a380", "boeing-747"],
  ["boeing-787", "airbus-a330"],
  ["airbus-a220", "embraer-e-jet"],
  ["boeing-777", "boeing-787"],
  ["boeing-767", "airbus-a330"],
];

export const comparisonSlug = (a: string, b: string) => `${a}-vs-${b}`;

const nl = (n: number, digits = 0) =>
  n.toLocaleString("nl-NL", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmt = {
  m: (n: number) => `${nl(n, 1)} m`,
  t: (n: number) => `${nl(n, 1)} t`,
  km: (n: number) => `${nl(n)} km`,
};
