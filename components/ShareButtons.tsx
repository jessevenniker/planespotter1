"use client";

import { useState } from "react";

/** Delen via het deelmenu van de telefoon, of de link kopiëren; plus de story-afbeelding. */
export default function ShareButtons({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/log/${id}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      // Delen geannuleerd.
    }
  };
  return (
    <>
      <button type="button" onClick={share} className="border border-ink px-4 py-2 text-sm hover:bg-paper-2">
        {copied ? "Link gekopieerd" : "Deel"}
      </button>
      <a
        href={`/log/${id}/story.png`}
        download={`dutchplanes-${id}.png`}
        className="border border-ink px-4 py-2 text-sm text-ink no-underline hover:bg-paper-2"
      >
        Story-afbeelding
      </a>
    </>
  );
}
