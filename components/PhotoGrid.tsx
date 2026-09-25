import Image from "next/image";
import Link from "next/link";
import {
  CATEGORIES,
  Entry,
  altText,
  formatSpotted,
  specialReason,
} from "@/lib/photos";

/**
 * Foto's als contactvel: per toestel de foto met registratie of type,
 * maatschappij en tijd eronder. Gebruikt op dag-, maatschappij- en
 * collectiepagina's.
 */
export default function PhotoGrid({
  entries,
  showReason = false,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  entries: Entry[];
  showReason?: boolean;
  columns?: string;
}) {
  return (
    <ul className={`grid gap-x-6 gap-y-8 ${columns}`}>
      {entries.map((e) => {
        const reason = specialReason(e);
        return (
          <li key={e.id} className="border-t border-rule pt-3">
            <Link href={`/log/${e.id}`} className="block text-ink no-underline">
              <div className="relative aspect-[3/2] bg-paper-2">
                <Image
                  src={e.image.src}
                  alt={altText(e)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover"
                />
                {reason && (
                  <span className="absolute left-2 top-2 bg-plate px-1.5 py-0.5 text-xs">
                    ★ {showReason ? reason : ""}
                  </span>
                )}
              </div>
              <p className="mt-3">
                {e.registration ? (
                  <span className="reg">{e.registration}</span>
                ) : (
                  <span className="font-semibold">{e.type}</span>
                )}
                {e.registration && <span className="data ml-2 text-sm">{e.typeShort}</span>}
              </p>
              <p className="text-sm text-ink/70">{e.operator ?? CATEGORIES[e.category]}</p>
              {e.spottedAt && (
                <p className="data mt-1 text-xs text-ink/60">{formatSpotted(e.spottedAt)}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
