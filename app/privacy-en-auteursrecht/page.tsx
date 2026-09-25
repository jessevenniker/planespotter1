import Link from "next/link";
import { SITE } from "@/lib/seo";

export const metadata = {
  title: "Privacy en auteursrecht",
  description:
    "Welke gegevens deze website verwerkt, welke rechten je hebt en wat wel en niet mag met de foto's van planespotternederland.",
  alternates: { canonical: "/privacy-en-auteursrecht" },
};

/** Datum van de laatste inhoudelijke wijziging van deze pagina. */
const BIJGEWERKT = "25 september 2026";

export default function PrivacyEnAuteursrecht() {
  const mail = (
    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
  );

  return (
    <article className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Privacy en auteursrecht</h1>
      <p className="mt-3 text-sm text-ink/70">Laatst bijgewerkt op {BIJGEWERKT}.</p>

      <nav aria-label="Op deze pagina" className="mt-6 text-sm">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><a href="#privacy">Privacyverklaring</a></li>
          <li><a href="#auteursrecht">Auteursrecht</a></li>
          <li><a href="#tekst-en-datamining">Tekst- en datamining</a></li>
          <li><a href="#gegevens">Juistheid van de gegevens</a></li>
        </ul>
      </nav>

      <div className="mt-10 max-w-[68ch] space-y-10">
        <section aria-labelledby="privacy">
          <h2 id="privacy" className="text-xl">Privacyverklaring</h2>

          <h3 className="mt-6 text-lg">Wie is verantwoordelijk</h3>
          <p className="mt-2">
            Deze website ({SITE.legalName}, ook bekend als {SITE.name}) wordt
            geëxploiteerd door {SITE.operator}, de verwerkingsverantwoordelijke
            in de zin van de Algemene verordening gegevensbescherming (AVG). Voor vragen over privacy kun je mailen
            naar {mail}.
          </p>

          <h3 className="mt-6 text-lg">Wat we niet doen</h3>
          <p className="mt-2">
            Deze website gebruikt geen cookies, geen analyse- of
            advertentiediensten en geen trackingpixels. Er zijn geen accounts
            en geen formulieren. Lettertypen worden vanaf onze eigen server
            geladen, niet vanaf een externe dienst. We verkopen of verhuren
            geen persoonsgegevens.
          </p>

          <h3 className="mt-6 text-lg">Wat er wel wordt verwerkt</h3>
          <p className="mt-2">
            <strong className="font-semibold">Serverlogs.</strong> Bij elk
            bezoek registreert de server technische gegevens: je IP-adres, het
            tijdstip, de opgevraagde pagina, het type browser en de pagina
            waarvandaan je kwam. Dat is nodig om de website te laten werken, te
            beveiligen en storingen of misbruik op te sporen. De grondslag is ons
            gerechtvaardigd belang bij een veilige en werkende website (artikel
            6, lid 1, onder f AVG). Deze logs worden niet gebruikt om bezoekers
            te volgen of profielen te maken en worden niet langer bewaard dan
            voor die doelen nodig is.
          </p>
          <p className="mt-3">
            <strong className="font-semibold">E-mail.</strong> Als je ons mailt,
            gebruiken we je naam, e-mailadres en de inhoud van je bericht om je
            vraag te beantwoorden. De grondslag is ons gerechtvaardigd belang om
            op berichten te reageren, of de uitvoering van een overeenkomst als je
            vraag daarover gaat. We bewaren de correspondentie niet langer dan
            nodig is om je vraag af te handelen, tenzij een wettelijke
            bewaarplicht geldt.
          </p>

          <h3 className="mt-6 text-lg">Wie de gegevens nog meer ziet</h3>
          <p className="mt-2">
            De website wordt gehost door Vercel Inc. in de Verenigde Staten. Vercel
            verwerkt de serverlogs als verwerker in onze opdracht. Voor de
            doorgifte naar de Verenigde Staten gelden de waarborgen van het
            EU-VS Data Privacy Framework en de standaardcontractbepalingen van de
            Europese Commissie. Verder delen we gegevens alleen als de wet ons
            daartoe verplicht.
          </p>

          <h3 className="mt-6 text-lg">Links naar andere websites</h3>
          <p className="mt-2">
            Deze website linkt naar Instagram. Zodra je doorklikt, geldt het
            privacybeleid van die dienst. Wij hebben geen invloed op wat daar
            met je gegevens gebeurt.
          </p>

          <h3 className="mt-6 text-lg">Personen op foto&apos;s</h3>
          <p className="mt-2">
            De foto&apos;s tonen vliegtuigen. Sta je zelf herkenbaar op een foto
            en wil je dat die wordt aangepast of verwijderd, mail dan naar{" "}
            {mail}. We handelen zo&apos;n verzoek zo snel mogelijk af.
          </p>

          <h3 className="mt-6 text-lg">Je rechten</h3>
          <p className="mt-2">
            Je hebt het recht om je gegevens in te zien, te laten corrigeren of
            te laten verwijderen, de verwerking te laten beperken, bezwaar te
            maken tegen de verwerking en je gegevens over te laten dragen
            (artikelen 15 tot en met 21 AVG). Stuur je verzoek naar {mail}. We
            reageren binnen een maand. We kunnen je vragen je identiteit aan te
            tonen, zodat we gegevens niet aan de verkeerde persoon geven.
          </p>
          <p className="mt-3">
            Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je
            een klacht indienen bij de{" "}
            <a href="https://autoriteitpersoonsgegevens.nl">
              Autoriteit Persoonsgegevens
            </a>
            . We stellen het op prijs als je eerst contact met ons opneemt.
          </p>

          <h3 className="mt-6 text-lg">Wijzigingen</h3>
          <p className="mt-2">
            Als de website verandert, bijvoorbeeld wanneer prints en downloads te
            koop komen, passen we deze verklaring aan. De datum bovenaan laat
            zien wanneer dat voor het laatst gebeurde.
          </p>
        </section>

        <section aria-labelledby="auteursrecht">
          <h2 id="auteursrecht" className="text-xl">Auteursrecht</h2>
          <p className="mt-2">
            Alle foto&apos;s op deze website zijn gemaakt door de fotograaf van{" "}
            {SITE.legalName} en zijn beschermd door de Auteurswet. De
            auteursrechten berusten bij de maker. Ook de teksten, de opbouw van
            het logboek en de vormgeving van de website zijn beschermd.
          </p>

          <h3 className="mt-6 text-lg">Wat niet mag zonder toestemming</h3>
          <p className="mt-2">
            Zonder voorafgaande schriftelijke toestemming is het niet toegestaan
            om foto&apos;s van deze website te kopiëren, downloaden, opnieuw te
            publiceren, te bewerken, te verkopen of op een andere manier
            openbaar te maken of te verveelvoudigen. Dat geldt ook voor gebruik
            op sociale media, in drukwerk en op andere websites, en voor het
            verwijderen of afsnijden van naamsvermelding of watermerk.
          </p>

          <h3 className="mt-6 text-lg">Wat wel mag</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Linken naar een pagina van deze website, zonder de foto zelf over
              te nemen.
            </li>
            <li>
              Citeren binnen de grenzen van artikel 15a van de Auteurswet: alleen
              ter ondersteuning van een eigen bespreking of recensie, niet meer
              dan nodig en met duidelijke bronvermelding (&ldquo;Foto:{" "}
              {SITE.legalName}&rdquo;) en een link naar de pagina.
            </li>
          </ul>

          <h3 className="mt-6 text-lg">Gebruik of licentie aanvragen</h3>
          <p className="mt-2">
            Wil je een foto gebruiken, bijvoorbeeld voor een publicatie, een
            website of commercieel? Mail dan naar {mail} met de foto, het
            beoogde gebruik en de periode. Je krijgt dan een voorstel voor een
            licentie.
          </p>

          <h3 className="mt-6 text-lg">Bij inbreuk</h3>
          <p className="mt-2">
            Wordt een foto zonder toestemming gebruikt, dan kunnen we verlangen
            dat het gebruik direct stopt en een schadevergoeding vorderen, ten
            minste ter hoogte van een gangbare licentievergoeding.
          </p>
        </section>

        <section aria-labelledby="tekst-en-datamining">
          <h2 id="tekst-en-datamining" className="text-xl">
            Tekst- en datamining
          </h2>
          <p className="mt-2">
            Op grond van artikel 15o van de Auteurswet (artikel 4, lid 3 van
            Richtlijn (EU) 2019/790) maakt de rechthebbende uitdrukkelijk
            voorbehoud tegen tekst- en datamining van de werken op deze
            website. Het verzamelen of
            gebruiken van foto&apos;s, teksten of gegevens van deze website voor
            het trainen, ontwikkelen of verbeteren van AI-modellen is zonder
            schriftelijke toestemming niet toegestaan.
          </p>
          <p className="mt-3">
            Dit voorbehoud is ook machineleesbaar vastgelegd in{" "}
            <a href="/robots.txt">robots.txt</a> en via het TDM Reservation
            Protocol (<a href="/.well-known/tdmrep.json">tdmrep.json</a>).
            Zoekmachines en AI-zoekdiensten mogen deze website indexeren en
            ernaar verwijzen met bronvermelding. Dat is geen toestemming voor
            training.
          </p>
        </section>

        <section aria-labelledby="gegevens">
          <h2 id="gegevens" className="text-xl">Juistheid van de gegevens</h2>
          <p className="mt-2">
            Type, maatschappij en registratie in het logboek zijn vastgesteld aan
            de hand van de foto&apos;s; datum en tijd komen uit de camera. Ze
            worden met zorg vastgelegd, maar kunnen fouten bevatten. Aan de
            gegevens kunnen geen rechten worden ontleend. {SITE.operator} is niet
            aansprakelijk voor schade die ontstaat doordat iemand op deze
            gegevens vertrouwt, behalve bij opzet of grove nalatigheid. Zie je
            een fout, mail dan naar {mail}.
          </p>
          <p className="mt-3">
            Namen en logo&apos;s van luchtvaartmaatschappijen en vliegtuigbouwers
            zijn eigendom van de betreffende rechthebbenden. Ze worden hier
            alleen beschrijvend gebruikt en betekenen niet dat er een
            samenwerking bestaat.
          </p>
          <p className="mt-3">Op deze website en deze voorwaarden is Nederlands recht van toepassing.</p>
        </section>
      </div>

      <p className="mt-12 text-sm">
        <Link href="/">Terug naar het log</Link>
      </p>
    </article>
  );
}
