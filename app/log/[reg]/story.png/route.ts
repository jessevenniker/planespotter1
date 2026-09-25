import { storyCard } from "@/lib/card";
import { getEntry } from "@/lib/log";

// Instagram-story (1080 × 1920) per entry. Op aanvraag, daarna in het CDN.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ reg: string }> }) {
  const { reg } = await params;
  const e = getEntry(reg);
  if (!e) return new Response("Niet gevonden", { status: 404 });
  return storyCard(e);
}
