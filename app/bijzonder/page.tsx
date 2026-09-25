import PhotoGrid from "@/components/PhotoGrid";
import { specialReason } from "@/lib/photos";
import { specialEntries } from "@/lib/log";

export const metadata = {
  title: "Bijzondere bezoekers op Schiphol",
  description:
    "De BelugaXL, een F-35, de NAVO-tanker, helikopters en speciale kleurstellingen van KLM, Transavia, Garuda en Saudia, gespot op Schiphol.",
  alternates: { canonical: "/bijzonder" },
};

const GROUPS: { title: string; match: (r: string) => boolean }[] = [
  { title: "Zeldzame bezoekers", match: (r) => r === "Bijzondere bezoeker" },
  { title: "Militair en helikopters", match: (r) => r === "Militair" || r === "Helikopter" },
  { title: "Speciale kleurstellingen", match: (r) => !["Bijzondere bezoeker", "Militair", "Helikopter"].includes(r) },
];

export default function SpecialPage() {
  const list = specialEntries();

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Bijzonder</h1>
      <p className="mt-3 max-w-[60ch]">
        Alles wat je niet elke dag voorbij ziet komen. <span className="data">{list.length}</span>{" "}
        toestellen uit het log.
      </p>

      {GROUPS.map((g) => {
        const items = list.filter((e) => g.match(specialReason(e)!));
        if (!items.length) return null;
        return (
          <div key={g.title} className="mt-12">
            <h2 className="border-t border-ink pt-4 text-xl">
              {g.title} <span className="data text-base font-normal text-ink/60">{items.length}</span>
            </h2>
            <div className="mt-6">
              <PhotoGrid entries={items} showReason />
            </div>
          </div>
        );
      })}
    </section>
  );
}
