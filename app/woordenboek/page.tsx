import Link from "next/link";
import { SITE } from "@/lib/seo";

export const metadata = {
  title: "Spotterswoordenboek: vliegtuigspotten van A tot Z",
  description:
    "Wat is een heavy, een go-around of een registratie? De begrippen die vliegtuigspotters op Schiphol gebruiken, kort en duidelijk uitgelegd.",
  alternates: { canonical: "/woordenboek" },
};

// Begrippen die spotters gebruiken. Waar een pagina op de site het begrip
// laat zien, linken we ernaar.
const TERMS: { term: string; def: string; link?: [string, string] }[] = [
  { term: "Spotten", def: "Vliegtuigen observeren, fotograferen en vastleggen, meestal met registratie, type en datum. Wie het doet heet een spotter." },
  { term: "Registratie", def: "Het unieke kenteken van een vliegtuig, zoals PH-BHN. De letters voor het streepje geven het land aan: PH is Nederland, D Duitsland, N de Verenigde Staten.", link: ["/", "Registraties in het log"] },
  { term: "EHAM", def: "De ICAO-code van Amsterdam Airport Schiphol. De IATA-code, die reizigers op hun ticket zien, is AMS." },
  { term: "Polderbaan", def: "Baan 18R/36L, de langste en meest gebruikte baan van Schiphol, ver ten noordwesten van de terminal. Geliefd bij spotters om de vrije ligging.", link: ["/baan/18r", "Polderbaan"] },
  { term: "Kaagbaan", def: "Baan 06/24, veel gebruikt voor starts richting het zuidwesten. Goed te zien vanaf de Aalsmeerderdijk.", link: ["/baan/06", "Kaagbaan"] },
  { term: "Heavy", def: "Een zwaar vliegtuig met een maximaal startgewicht boven 136 ton, zoals de 777, 787, A350 en 747. De piloot zegt het woord in de roepnaam, vanwege de grotere wervelingen achter het toestel." },
  { term: "Widebody", def: "Een vliegtuig met een brede romp en twee gangpaden, zoals de Boeing 787 of Airbus A330.", link: ["/vliegtuig", "Vliegtuigtypes"] },
  { term: "Narrowbody", def: "Een vliegtuig met een smalle romp en één gangpad, zoals de Boeing 737 of Airbus A320." },
  { term: "Livery", def: "De beschildering van een vliegtuig in de huisstijl van de maatschappij. Een speciale kleurstelling heet een special livery.", link: ["/bijzonder", "Speciale kleurstellingen"] },
  { term: "Rotatie", def: "Het moment bij de start waarop het neuswiel loskomt en het vliegtuig de neus omhoog brengt. Een favoriet moment om te fotograferen." },
  { term: "Touchdown", def: "Het moment waarop de wielen bij de landing de baan raken, vaak met een wolkje rook van de banden." },
  { term: "Go-around", def: "Een afgebroken landing: het vliegtuig trekt op en maakt een nieuwe nadering, bijvoorbeeld door wind of een bezette baan." },
  { term: "Final", def: "Het laatste, rechte deel van de nadering, recht in het verlengde van de baan." },
  { term: "Winglet", def: "Een opstaand vleugeltipje dat de luchtweerstand verlaagt. Airbus noemt de nieuwere versie een sharklet." },
  { term: "Sharklet", def: "De gebogen winglet van de Airbus A320-familie en de A330neo." },
  { term: "Chevrons", def: "Gekartelde achterranden aan straalmotoren, zoals bij de Boeing 787 en 737 MAX, die het motorgeluid verminderen." },
  { term: "Neo en ceo", def: "Bij Airbus: new engine option en current engine option. De neo heeft zuinigere, grotere motoren." },
  { term: "Vrachtversie", def: "Een vliegtuig zonder passagiersramen dat alleen vracht vervoert, herkenbaar aan een F in de typenaam, zoals 777F of 747-400F." },
  { term: "Cityhopper", def: "KLM Cityhopper, de regionale dochter van KLM die met Embraer-toestellen naar Europese bestemmingen vliegt.", link: ["/maatschappij/klm-cityhopper", "KLM Cityhopper"] },
  { term: "METAR", def: "Een weerbericht voor de luchtvaart met wind, zicht en bewolking. Spotters gebruiken het om te voorspellen welke banen in gebruik zijn." },
  { term: "Baanwissel", def: "Het moment waarop Schiphol overstapt op andere start- en landingsbanen, meestal door een draaiende wind." },
  { term: "Brandpuntsafstand", def: "Hoe ver een objectief inzoomt, in millimeter. Spotters gebruiken vaak 100 tot 600 mm.", link: ["/statistieken", "Brandpunten in het log"] },
  { term: "Gouden uur", def: "Het uur rond zonsopkomst en zonsondergang, met warm, laag licht. Op deze site berekend uit de zonnehoogte boven Schiphol.", link: ["/statistieken", "Licht in het log"] },
  { term: "Blauwe uur", def: "De schemering net na zonsondergang of voor zonsopkomst, wanneer de lucht diepblauw is en de lichten van vliegtuigen al aan zijn." },
  { term: "Hittetrilling", def: "Luchttrilling boven warm asfalt die verre vliegtuigen op foto's vervormt. Vooral op zomermiddagen." },
  { term: "Cop", def: "Spotterstaal voor een registratie die je voor het eerst ziet en in je logboek kunt bijschrijven.", link: ["/mijn-spotlog", "Mijn spotlog"] },
  { term: "Zakenjet", def: "Een klein privévliegtuig voor zakenreizen, zoals een Challenger of Citation. Op Schiphol vertrekken ze vaak van de General Aviation-kant." },
];

export default function Glossary() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, "nl"));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE.url}/woordenboek`,
    name: "Spotterswoordenboek",
    inLanguage: "nl-NL",
    hasDefinedTerm: sorted.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.def,
      url: `${SITE.url}/woordenboek#${encodeURIComponent(t.term.toLowerCase().replace(/\s+/g, "-"))}`,
    })),
  };

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl">Spotterswoordenboek</h1>
      <p className="mt-3 max-w-[62ch]">
        De woorden die je aan de rand van Schiphol hoort, kort uitgelegd.
      </p>
      <dl className="mt-8 grid max-w-[80ch] gap-0 border-t border-rule">
        {sorted.map((t) => (
          <div key={t.term} id={t.term.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-6 border-b border-rule py-4">
            <dt className="text-lg font-semibold">{t.term}</dt>
            <dd className="mt-1">
              {t.def}
              {t.link && (
                <>
                  {" "}
                  <Link href={t.link[0]}>{t.link[1]}</Link>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
