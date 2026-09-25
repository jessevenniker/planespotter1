import Spotdle from "@/components/Spotdle";
import { entries } from "@/lib/log";
import { FOCUS } from "@/lib/focus";
import { buildPuzzles } from "@/lib/spotdle";

export const metadata = {
  title: "Spotdle, raad het toestel",
  description:
    "Elke dag één foto van Schiphol, eerst ver ingezoomd. Raad het type in zes pogingen en deel je score.",
  alternates: { canonical: "/spotdle" },
};

export default function SpotdlePage() {
  const puzzles = buildPuzzles(entries, FOCUS);
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Spotdle</h1>
      <p className="mt-2 max-w-[60ch] text-ink/70">
        Elke dag één toestel uit het log, eerst ver ingezoomd. Raad de typefamilie in
        zes pogingen. Om middernacht staat er een nieuwe klaar.
      </p>
      <div className="mt-8">
        <Spotdle puzzles={puzzles} />
      </div>
    </section>
  );
}
