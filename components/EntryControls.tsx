"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Viewfinder from "@/components/Viewfinder";
import type { ViewItem } from "@/lib/photos";

/** Het log voor de zoeker: pas ophalen als iemand hem opent, en dan één keer. */
let cache: Promise<ViewItem[]> | null = null;
const loadLog = () => (cache ??= fetch("/log.json").then((r) => r.json()));

/**
 * Op een entrypagina: pijltjes gaan naar het nieuwere of oudere toestel, V opent
 * de zoeker op deze foto. De zoeker laadt de lijst pas als hij geopend wordt.
 */
export default function EntryControls({
  id,
  newerId,
  olderId,
}: {
  id: string;
  newerId: string | null;
  olderId: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<ViewItem[] | null>(null);
  const [open, setOpen] = useState(false);

  const openViewer = useCallback(async () => {
    setItems(await loadLog());
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (open) return;
      const t = ev.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (ev.key === "ArrowLeft" && newerId) router.push(`/log/${newerId}`);
      else if (ev.key === "ArrowRight" && olderId) router.push(`/log/${olderId}`);
      else if (ev.key === "v") openViewer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, newerId, olderId, router, openViewer]);

  return (
    <>
      <button
        type="button"
        onClick={openViewer}
        className="border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-approach"
      >
        Open de zoeker <span className="data text-paper/60">v</span>
      </button>
      {open && items && (
        <Viewfinder
          items={items}
          start={Math.max(0, items.findIndex((i) => i.id === id))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/** Een willekeurig toestel uit het log. */
export function RandomButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const log = await loadLog();
        router.push(`/log/${log[Math.floor(Math.random() * log.length)].id}`);
      }}
    >
      Willekeurig
    </button>
  );
}
