import { notFound } from "next/navigation";
import { entryCard } from "@/lib/card";
import { getEntry } from "@/lib/log";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Deelkaart van een entry uit het logboek van Dutchplanes";

// Op aanvraag gemaakt en daarna door het CDN bewaard; 125 PNG's meebouwen
// maakt elke deploy honderden megabytes zwaarder.
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ reg: string }> }) {
  const { reg } = await params;
  const e = getEntry(reg);
  if (!e) notFound();
  return entryCard(e);
}
