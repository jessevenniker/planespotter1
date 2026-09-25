import {
  Entry,
  RUNWAYS,
  DOWNLOAD_PRICE_EUR,
  availableSizes,
  altText,
  isComplete,
  typeEnMaatschappij,
} from "./photos";

export const SITE = {
  name: "Dutchplanes",
  legalName: "planespotternederland",
  url: "https://www.planespotternederland.nl",
  description:
    "Logboek van vliegtuigen gespot op Schiphol, met registratie, type en baan per foto. Prints en digitale downloads.",
  locale: "nl_NL",
  instagram: "https://www.instagram.com/planespotternederland/",
  /** De rechtspersoon achter de site: verantwoordelijke onder de AVG. */
  operator: "Jesco Innovation B.V.",
  email: "info@jescoinnovation.com",
};

/**
 * Eén gedeelde @id voor de fotograaf, zodat zoekmachines en taalmodellen alle
 * entries aan dezelfde persoon koppelen in plaats van aan losse pagina's.
 */
export const personId = `${SITE.url}/#fotograaf`;

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  alternateName: SITE.legalName,
  description: SITE.description,
  inLanguage: "nl-NL",
  publisher: {
    "@type": "Person",
    "@id": personId,
    name: SITE.name,
    jobTitle: "Luchtvaartfotograaf",
    sameAs: [SITE.instagram],
    knowsAbout: [
      "Luchtvaartfotografie",
      "Vliegtuigspotten",
      "Amsterdam Airport Schiphol",
    ],
  },
});

/**
 * Structured data voor één entry. Onvolledige entries krijgen bewust géén
 * Product-blok: prijzen adverteren voor iets dat niet te koop is, is precies
 * het soort fout waar Google structured data voor bestraft.
 */
export const entryJsonLd = (e: Entry) => {
  const url = `${SITE.url}/log/${e.id}`;
  const imageUrl = `${SITE.url}${e.image.src}`;
  const sizes = availableSizes(e);

  const photograph: Record<string, unknown> = {
    "@type": "Photograph",
    "@id": `${url}#foto`,
    name: e.registration
      ? `${typeEnMaatschappij(e)}, ${e.registration}`
      : typeEnMaatschappij(e),
    ...(e.note ? { description: e.note } : {}),
    creator: { "@id": personId },
    copyrightHolder: { "@id": personId },
    associatedMedia: {
      "@type": "ImageObject",
      contentUrl: imageUrl,
      width: e.image.fullWidth,
      height: e.image.fullHeight,
      caption: altText(e),
      encodingFormat: "image/jpeg",
    },
    about: [
      { "@type": "Thing", name: e.type },
      ...(e.operator ? [{ "@type": "Organization", name: e.operator }] : []),
    ],
  };

  if (e.spottedAt) photograph.dateCreated = e.spottedAt;
  if (e.runway) {
    photograph.contentLocation = {
      "@type": "Place",
      name: `${RUNWAYS[e.runway].name}, Amsterdam Airport Schiphol`,
      address: {
        "@type": "PostalAddress",
        addressLocality: e.location ?? "Haarlemmermeer",
        addressCountry: "NL",
      },
    };
  }

  const graph: Record<string, unknown>[] = [photograph];

  if (e.forSale && sizes.length > 0) {
    graph.push({
      "@type": "Product",
      "@id": `${url}#product`,
      name: `${e.type}${e.registration ? ` ${e.registration}` : ""}, print`,
      description: `Fine art print van een ${typeEnMaatschappij(e)}, gefotografeerd op Schiphol.`,
      image: imageUrl,
      brand: { "@type": "Brand", name: SITE.name },
      offers: [
        ...sizes.map((s) => ({
          "@type": "Offer",
          name: `Print ${s.label}`,
          price: s.priceEur,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url,
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "NL",
            },
          },
        })),
        {
          "@type": "Offer",
          name: "Digitale download, volledige resolutie",
          price: DOWNLOAD_PRICE_EUR,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url,
        },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${SITE.url}${item.path}`,
  })),
});

export const runwayJsonLd = (code: string, count: number) => {
  const rw = RUNWAYS[code];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Vliegtuigen gespot bij de ${rw.name} (${code})`,
    description: rw.description,
    url: `${SITE.url}/baan/${code.toLowerCase()}`,
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: {
      "@type": "Place",
      name: `${rw.name}, Amsterdam Airport Schiphol`,
    },
    mainEntity: { "@type": "ItemList", numberOfItems: count },
  };
};

/** Titel en beschrijving worden uit de data opgebouwd, nooit los geschreven. */
export const entryMeta = (e: Entry) => {
  const naam = e.registration
    ? `${e.registration} ${e.type}`
    : typeEnMaatschappij(e);
  const plek = e.runway
    ? ` bij de ${RUNWAYS[e.runway].name}`
    : e.location
      ? ` op ${e.location}`
      : "";
  const datum = e.spottedAt ? ` op ${e.spottedAt.slice(0, 10)}` : "";

  return {
    title: `${naam}${plek}`,
    description: `${typeEnMaatschappij(e)}${e.registration ? ` met registratie ${e.registration}` : ""}, gefotografeerd${plek}${datum}.${
      e.forSale ? " Beschikbaar als print en als digitale download." : ""
    }`,
    // Onvolledige entries worden niet geïndexeerd: een pagina met "onbekend"
    // in drie velden is geen pagina waarop je gevonden wilt worden.
    index: isComplete(e),
  };
};
