import SpotlogDashboard, { LogItem } from "@/components/SpotlogDashboard";
import { lightOf, operatorSlug, specialReason } from "@/lib/photos";
import { sortedEntries } from "@/lib/log";
import { familyOf } from "@/lib/spotdle";

export const metadata = {
  title: "Mijn spotlog",
  description:
    "Vink af welke toestellen uit het log je zelf ook gezien hebt, verdien badges en houd je voortgang per maatschappij en type bij.",
  alternates: { canonical: "/mijn-spotlog" },
};

export default function MySpotlogPage() {
  const items: LogItem[] = sortedEntries().map((e) => ({
    id: e.id,
    label: e.registration ? `${e.registration} · ${e.typeShort}` : e.typeShort,
    type: e.type,
    typeShort: e.typeShort,
    operator: e.operator,
    operatorSlug: operatorSlug(e),
    category: e.category,
    family: familyOf(e.type),
    light: lightOf(e.sunAltitude)?.key ?? null,
    special: specialReason(e),
    date: e.spottedAt?.slice(0, 10) ?? null,
    src: e.image.src,
  }));

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Mijn spotlog</h1>
      <p className="mt-2 max-w-[60ch] text-ink/70">
        Heb je deze toestellen zelf ook gezien? Vink ze af en houd bij hoe ver je bent.
        Je spotlog staat alleen in je eigen browser.
      </p>
      <div className="mt-8">
        <SpotlogDashboard items={items} />
      </div>
    </section>
  );
}
