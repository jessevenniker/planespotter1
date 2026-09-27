import { arrivals, isConfigured } from "@/lib/schiphol";
import { entries } from "@/lib/log";

export const dynamic = "force-dynamic";

// Het CDN bewaart het antwoord een minuut: zo blijft het aantal aanroepen naar
// Schiphol laag, hoeveel bezoekers er ook tegelijk kijken.
const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" };

export async function GET() {
  if (!isConfigured()) {
    return Response.json({ configured: false, arrivals: [] }, { status: 503 });
  }
  try {
    const list = await arrivals();
    // Staat dit toestel al in het logboek? Dan linken we ernaar.
    const byReg = new Map(entries.filter((e) => e.registration).map((e) => [e.registration!, e.id]));
    return Response.json(
      {
        configured: true,
        updated: new Date().toISOString(),
        arrivals: list.map((a) => ({ ...a, logId: a.registration ? (byReg.get(a.registration) ?? null) : null })),
      },
      { headers: CACHE }
    );
  } catch (err) {
    console.error(err);
    return Response.json({ configured: true, error: "Schiphol is even niet bereikbaar.", arrivals: [] }, { status: 502 });
  }
}
