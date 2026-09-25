# Dutchplanes, fase 1

Logboek, entrypagina's, baanpagina's en typepagina's. Nog geen betalingen: de
knoppen staan er wel, maar doen nog niets. Dat is fase 2.

## Installeren

```bash
npx create-next-app@latest dutchplanes --typescript --tailwind --app --src-dir=false
# kopieer app/, lib/ en components/ uit deze map er overheen
npm run dev
```

Zet in `next.config.ts` niets bijzonders. Alle pagina's zijn statisch, dus
`next build` levert pure HTML op. Dat is bewust: statische HTML is wat crawlers
en taalmodellen het betrouwbaarst kunnen lezen.

Foto's horen in `public/photos/` met de bestandsnamen die in `lib/photos.ts`
staan, bijvoorbeeld `ph-nxa.jpg`. Zolang die er niet zijn, geeft `next/image`
een foutmelding.

## Wat waar zit

| Bestand | Rol |
|---|---|
| `lib/entries.ts` | Alle data: één blok per foto. Dit is de enige plek die je aanpast bij een nieuwe foto. |
| `lib/photos.ts` | Types en pure hulpfuncties (opmaak, licht, bijzonder). Veilig voor client components. |
| `lib/log.ts` | Queries op het log: per dag, per maatschappij, buren, statistieken. Alleen server. |
| `lib/seo.ts` | Structured data en metadata, opgebouwd uit de data. |
| `components/LogExplorer.tsx` | Het log op de homepage: zoeken, filters, sorteren, per spotdag, contactvel. |
| `components/SplitFlapBoard.tsx` | Het vertrekbord met klepletters bovenaan de homepage. |
| `components/Viewfinder.tsx` | De zoeker: schermvullend bladeren met de belichting in beeld. |
| `components/Charts.tsx` | Staven en kolommen voor de statistieken, met tabelweergave. |
| `app/dag`, `app/maatschappij`, `app/statistieken`, `app/bijzonder` | Verzamelpagina's, genereren zichzelf. |
| `app/log.json/route.ts` | Compacte lijst voor de zoeker en de knop Willekeurig. |
| `app/sitemap.ts` | Sitemap, genereert zichzelf. |
| `app/robots.ts` | Crawltoegang: zoekcrawlers ja, trainingscrawlers nee. |
| `app/llms.txt/route.ts` | Platte samenvatting voor taalmodellen. |

Een nieuwe foto toevoegen is één blok in `lib/entries.ts`. Dagpagina's,
maatschappijpagina's, statistieken, sitemap, structured data en llms.txt
updaten allemaal automatisch mee.

## De SEO-keuzes

**De baanpagina's zijn de ingang, niet de homepage.** Mensen zoeken op
"Polderbaan spotten" en "spottersplek Schiphol", niet op de naam van je
broertje. Daarom hebben die pagina's eigen teksten, een eigen titel gericht op
de baannaam in plaats van de code, en de hoogste prioriteit in de sitemap.

**Elke entry is een eigen URL op registratie.** `/log/ph-nxa` is precies wat
iemand intypt die een specifiek toestel zoekt. Die pagina's veranderen nooit
meer na publicatie, dus ze krijgen `lastModified` op de fotodatum.

**Titels en alt-teksten worden uit de data gegenereerd.** Handgeschreven
alt-teksten worden vergeten of worden marketingtekst. Uit de data komt altijd
"Embraer E195-E2 van KLM Cityhopper, registratie PH-NXA, gefotografeerd bij de
Polderbaan op Schiphol". Dat is precies wat een zoekmachine wil.

**Interne links lopen via baan en type.** Elke entrypagina linkt naar zijn baan
en zijn type, en die linken terug. Dat maakt een dichte structuur zonder dat je
er iets voor hoeft te doen.

## De AIO-keuzes

Dit is het deel dat de meeste sites overslaan.

**Statische HTML, geen client-side rendering voor inhoud.** De logtabel is een
client component vanwege de foto-wissel, maar de tabelinhoud staat gewoon in de
HTML. Taalmodellen voeren geen JavaScript uit.

**Een echte `<table>` met `<caption>` en `<th scope>`.** Tabellen worden
betrouwbaarder geïnterpreteerd dan divs. Een assistent die gevraagd wordt
"welke bijzondere toestellen zijn er op Schiphol gespot" kan hier daadwerkelijk
rijen uit lezen.

**`/llms.txt`.** Een platte tekstsamenvatting van de hele site: wat het is, welke
banen er zijn, welke entries er staan, en de gebruiksvoorwaarden. Genereert
zichzelf uit dezelfde data. Kost niets en het is een opkomende conventie die
snel aan grond wint.

**AI-crawlers expliciet toegelaten in `robots.ts`.** GPTBot, ClaudeBot,
PerplexityBot en OAI-SearchBot mogen alles behalve de downloadpagina's en het
manifest. Dit is een keuze, geen vanzelfsprekendheid: je geeft de foto's prijs
aan modellen in ruil voor de kans dat je genoemd wordt als bron. Voor een klein
account dat bereik nodig heeft is dat de goede ruil, maar bespreek het even met
je broertje voordat het live gaat. CCBot staat op disallow omdat dat puur
scrapen is zonder verwijzing terug.

**`@id` op de fotograaf.** Alle structured data verwijst naar hetzelfde
persoons-id. Daardoor zien zoekmachines en modellen één fotograaf met een
verzameling werk, in plaats van losse pagina's.

**Schema.org Photograph plus Product.** Photograph beschrijft wat het is,
Product maakt de prijzen machineleesbaar. Een assistent die gevraagd wordt waar
je een print van een specifiek toestel koopt, kan dan de prijs noemen.

## Volgende stap

Fase 2: Stripe Checkout, de webhook, signed download-URL's. Daarvoor heb je een
Stripe-account nodig en de KVK-vraag moet beantwoord zijn.
