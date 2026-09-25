"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  ViewItem,
  formatSpotted,
  lightOf,
} from "@/lib/photos";

/**
 * De zoeker: het log schermvullend doorbladeren alsof je door de zoeker van de
 * camera kijkt. Onderin de belichting zoals een spiegelreflex hem toont,
 * bovenin wanneer en in welk licht. Pijltjes of vegen om te bladeren, R voor
 * een willekeurig toestel, I om de informatie te verbergen, Esc om te sluiten.
 */
export default function Viewfinder({
  items,
  start,
  onClose,
}: {
  items: ViewItem[];
  start: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const [hud, setHud] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const item = items[index];

  const go = useCallback(
    (d: number) => setIndex((i) => (i + d + items.length) % items.length),
    [items.length]
  );
  const random = useCallback(
    () => setIndex(Math.floor(Math.random() * items.length)),
    [items.length]
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
      else if (ev.key === "ArrowRight" || ev.key === "j") go(1);
      else if (ev.key === "ArrowLeft" || ev.key === "k") go(-1);
      else if (ev.key === "r") random();
      else if (ev.key === "i") setHud((h) => !h);
      else return;
      ev.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, random, onClose]);

  // De volgende en vorige foto alvast laden, zodat bladeren direct voelt.
  useEffect(() => {
    for (const d of [1, -1]) {
      const next = items[(index + d + items.length) % items.length];
      const img = new window.Image();
      img.src = next.image.src;
    }
  }, [index, items]);

  const light = lightOf(item.sunAltitude);
  const c = item.camera;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zoeker"
      className="fixed inset-0 z-50 bg-black text-paper"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- volle resolutie, vooraf geladen */}
      <img
        key={item.id}
        src={item.image.src}
        alt={[item.type, item.operator, item.registration].filter(Boolean).join(", ")}
        className="vf-fade absolute inset-0 m-auto max-h-full max-w-full object-contain"
      />

      {hud && (
        <div className="pointer-events-none absolute inset-0">
          {/* Hoeken en AF-punten van de zoeker */}
          <div className="absolute inset-6 sm:inset-12" aria-hidden>
            <span className="vf-corner left-0 top-0 border-l-2 border-t-2" />
            <span className="vf-corner right-0 top-0 border-r-2 border-t-2" />
            <span className="vf-corner bottom-0 left-0 border-b-2 border-l-2" />
            <span className="vf-corner bottom-0 right-0 border-b-2 border-r-2" />
            <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-5 gap-x-10 gap-y-6 opacity-70 max-sm:hidden">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) =>
                [2, 6, 7, 8, 12].includes(n) ? (
                  <span
                    key={n}
                    className={`block h-3 w-4 border ${n === 7 ? "border-plate" : "border-paper/60"}`}
                  />
                ) : (
                  <span key={n} />
                )
              )}
            </div>
          </div>

          <div className="data absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-6 py-4 text-sm sm:px-12">
            <span>{formatSpotted(item.spottedAt) ?? "datum onbekend"}</span>
            <span>
              {light && (
                <>
                  {light.label} · zon {item.sunAltitude}°
                </>
              )}
            </span>
            <span>
              {index + 1}/{items.length}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-10 sm:px-12">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <p className="data text-base text-paper sm:text-lg">
                {c ? (
                  <>
                    <span>{c.shutter}</span>
                    <span className="ml-5">F{c.aperture}</span>
                    {c.iso && <span className="ml-5">ISO {c.iso}</span>}
                    <span className="ml-5">{c.focalMm}mm</span>
                  </>
                ) : (
                  <span className="text-paper/60">geen belichtingsgegevens</span>
                )}
              </p>
              <p className="text-right">
                {item.registration ? (
                  <span className="reg mr-3 text-base">{item.registration}</span>
                ) : null}
                <span className="data">{item.typeShort}</span>
                {item.operator && <span className="ml-3">{item.operator}</span>}
                <span className="ml-3 text-paper/60">{CATEGORIES[item.category]}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-4 top-14 flex gap-2 sm:right-10">
        <Link
          href={`/log/${item.id}`}
          className="bg-paper/10 px-3 py-1.5 text-sm text-paper no-underline hover:bg-paper/20"
          onClick={onClose}
        >
          Details
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="bg-paper/10 px-3 py-1.5 text-sm hover:bg-paper/20"
        >
          Sluiten <span className="data text-paper/60">esc</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Vorige foto"
        className="absolute left-0 top-1/2 h-24 w-14 -translate-y-1/2 text-3xl text-paper/70 hover:text-paper"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Volgende foto"
        className="absolute right-0 top-1/2 h-24 w-14 -translate-y-1/2 text-3xl text-paper/70 hover:text-paper"
      >
        ›
      </button>

      <p className="data absolute bottom-1 left-1/2 hidden -translate-x-1/2 text-xs text-paper/40 sm:block">
        ← → bladeren · R willekeurig · I info
      </p>
    </div>
  );
}
