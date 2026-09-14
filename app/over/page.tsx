import Link from "next/link";
import { SITE } from "@/lib/seo";

export const metadata = {
  title: "Over",
  description:
    "Wie er achter Dutchplanes zit en hoe het logboek werkt: elke foto met registratie, type, maatschappij en baan.",
  alternates: { canonical: "/over" },
};

export default function Over() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Over Dutchplanes</h1>
      <div className="mt-6 max-w-[60ch] space-y-4">
        <p>
          Dutchplanes is het logboek van {SITE.legalName}. Elke foto is een
          regel in het log, met registratie, type, maatschappij, baan en het
          moment van spotten.
        </p>
        <p>
          De foto&apos;s zijn gemaakt rond Schiphol, vanaf de openbare
          spotplekken bij de banen. Welke baan in gebruik is hangt af van de
          wind, dus per baan staat erbij waar je kunt staan.
        </p>
        <p>
          Prints en digitale downloads volgen. Tot die tijd staat alles in het{" "}
          <Link href="/">log</Link> en op{" "}
          <a href={SITE.instagram}>Instagram</a>.
        </p>
      </div>
    </section>
  );
}
