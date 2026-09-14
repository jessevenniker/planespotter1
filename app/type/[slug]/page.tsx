import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allTypeSlugs,
  entriesByType,
  altText,
  formatDate,
  displayId,
} from "@/lib/photos";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return allTypeSlugs().map((s) => ({ slug: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: s } = await params;
  const list = entriesByType(s);
  if (list.length === 0) return {};
  const t = list[0];

  return {
    title: `${t.type} gespot op Schiphol`,
    description: `Foto's van de ${t.type} op Amsterdam Airport Schiphol, met registratie, maatschappij en baan per toestel. Te koop als print en download.`,
    alternates: { canonical: `/type/${s}` },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: s } = await params;
  const list = entriesByType(s);
  if (list.length === 0) notFound();
  const t = list[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Log", path: "/" },
              { name: t.type, path: `/type/${s}` },
            ])
          ),
        }}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10">
        <p className="data text-sm text-ink/60">Type</p>
        <h1 className="mt-1 text-2xl">{t.type}</h1>
        <p className="data mt-4 text-sm text-ink/60">
          {list.length} {list.length === 1 ? "entry" : "entries"} gelogd
        </p>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-10">
        <h2 className="sr-only">Entries van dit type</h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <li key={e.id} className="border-t border-rule pt-3">
              <Link href={`/log/${e.id}`} className="text-ink no-underline">
                <div className="relative aspect-[3/2] bg-paper-2">
                  <Image
                    src={e.image.src}
                    alt={altText(e)}
                    fill
                    sizes="(max-width: 640px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3"><span className="reg">{displayId(e)}</span></p>
                <p className="text-sm text-ink/70">{e.operator}</p>
                <p className="data mt-1 text-xs text-ink/60">
                  {formatDate(e.spottedAt)} · baan {e.runway}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
