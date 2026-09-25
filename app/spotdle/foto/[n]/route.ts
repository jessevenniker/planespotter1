import { assetBase } from "@/lib/card";
import { entries } from "@/lib/log";
import { FOCUS } from "@/lib/focus";
import { buildPuzzles } from "@/lib/spotdle";

export const dynamic = "force-dynamic";

const puzzles = buildPuzzles(entries, FOCUS);

// De foto van puzzel n, onder een neutrale URL. Met /photos/klm-787-... zou de
// bestandsnaam het antwoord verklappen. Doorgegeven vanaf de site en daarna
// door het CDN bewaard.
export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const p = puzzles[Number(n)];
  if (!p || !/^\d+$/.test(n)) return new Response("Niet gevonden", { status: 404 });
  const res = await fetch(`${assetBase()}/photos/${p.id}.jpg`);
  if (!res.ok) return new Response("Foto niet beschikbaar", { status: 502 });
  return new Response(res.body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
