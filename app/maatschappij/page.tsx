import Image from "next/image";
import Link from "next/link";
import { altText } from "@/lib/photos";
import { operators } from "@/lib/log";

export const metadata = {
  title: "Maatschappijen gespot op Schiphol",
  description:
    "Alle luchtvaartmaatschappijen in het logboek, van KLM tot Garuda Indonesia, met het aantal keer dat ze gespot zijn.",
  alternates: { canonical: "/maatschappij" },
};

export default function OperatorsIndex() {
  const list = operators();
  const max = list[0]?.entries.length ?? 1;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10">
      <h1 className="text-2xl">Maatschappijen</h1>
      <p className="mt-3 max-w-[60ch]">
        <span className="data">{list.length}</span> maatschappijen in het log,
        meest gespot bovenaan.
      </p>

      <ol className="mt-8 border-t border-rule">
        {list.map((o, i) => {
          const cover = o.entries[0];
          return (
            <li key={o.slug} className="border-b border-rule">
              <Link
                href={`/maatschappij/${o.slug}`}
                className="grid grid-cols-[2.5rem_4.5rem_1fr_auto] items-center gap-4 py-2 text-ink no-underline hover:bg-paper-2 sm:grid-cols-[2.5rem_6rem_14rem_1fr_auto]"
              >
                <span className="data text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative block aspect-[3/2] bg-paper-2">
                  <Image src={cover.image.src} alt={altText(cover)} fill sizes="96px" className="object-cover" />
                </span>
                <span className="font-semibold">{o.name}</span>
                <span className="hidden sm:block" aria-hidden>
                  <span
                    className="block h-2 rounded-r bg-approach"
                    style={{ width: `${Math.max((o.entries.length / max) * 100, 2)}%` }}
                  />
                </span>
                <span className="data text-right">{o.entries.length}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
