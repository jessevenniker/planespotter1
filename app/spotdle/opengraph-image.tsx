import { siteCard } from "@/lib/card";
import { getEntry } from "@/lib/log";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const alt = "Spotdle: raad het toestel";

export default async function Image() {
  // Een vaste foto die niet in het spel zit, zodat de kaart niets verklapt.
  const e = getEntry("ph-dis") ?? getEntry("ph-cgv")!;
  return siteCard({
    title: "Spotdle",
    subtitle: "Elke dag één toestel van Schiphol, ver ingezoomd. Raad het type in zes pogingen.",
    src: e.image.src,
  });
}
