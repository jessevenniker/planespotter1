import ArrivalsBoard from "@/components/ArrivalsBoard";

export const metadata = {
  title: "Live aankomsten op Schiphol voor spotters",
  description:
    "Welke vliegtuigen landen de komende uren op Schiphol: vlucht, herkomst, type en registratie. Bijzondere toestellen zoals de 747, A380 en vrachtvliegtuigen gemarkeerd.",
  alternates: { canonical: "/aankomsten" },
};

export default function ArrivalsPage() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Live aankomsten</h1>
      <p className="mt-2 max-w-[62ch] text-ink/70">
        Wat de komende uren op Schiphol landt, met type en registratie. Staat een
        toestel al in het logboek, dan linkt de registratie ernaar. Een ster
        betekent: de moeite van het omrijden waard.
      </p>
      <div className="mt-8">
        <ArrivalsBoard />
      </div>
      <p className="mt-4 text-xs text-ink/60">
        Bron: Schiphol Public Flight API. Tijden in lokale tijd; type en registratie
        zoals door de luchtvaartmaatschappij opgegeven, soms pas kort voor de landing bekend.
      </p>
    </section>
  );
}
