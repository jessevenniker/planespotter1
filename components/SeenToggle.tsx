"use client";

import { useSpotlog } from "@/lib/storage";

/** "Ook gezien?": zet een toestel in je eigen spotlog, of haalt het eruit. */
export default function SeenToggle({ id, label = "toestel" }: { id: string; label?: string }) {
  const { has, toggle } = useSpotlog();
  const on = has(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggle(id)}
      className={`border px-4 py-2 text-sm ${
        on ? "border-approach bg-approach text-paper" : "border-ink hover:bg-paper-2"
      }`}
    >
      {on ? "✓ Gezien, in je spotlog" : `Ook gezien? Zet dit ${label} in je spotlog`}
    </button>
  );
}

/** Klein vinkje over een foto als de bezoeker dit toestel al gezien heeft. */
export function SeenMark({ id, className = "" }: { id: string; className?: string }) {
  const { has } = useSpotlog();
  if (!has(id)) return null;
  return (
    <span className={`bg-approach px-1.5 py-0.5 text-xs text-paper ${className}`} title="In je spotlog">
      ✓ gezien
    </span>
  );
}
