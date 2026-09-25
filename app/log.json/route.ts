import { sortedEntries } from "@/lib/log";
import { toViewItem } from "@/lib/photos";

export const dynamic = "force-static";

// Het hele log als compacte lijst, voor de zoeker en de knop Willekeurig. Zo
// hoeft niet elke entrypagina alle 125 toestellen in de HTML mee te sturen.
export function GET() {
  return Response.json(sortedEntries().map(toViewItem));
}
