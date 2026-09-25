import { siteCard } from "@/lib/card";
import { sortedEntries } from "@/lib/log";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const alt = "Dutchplanes, logboek van vliegtuigen gespot op Schiphol";

export default async function Image() {
  const all = sortedEntries();
  return siteCard({
    title: "Logboek van Schiphol",
    subtitle: `${all.length} toestellen, elk met registratie, type, maatschappij en camera-instellingen.`,
    src: all[0].image.src,
  });
}
