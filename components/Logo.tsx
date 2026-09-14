/**
 * Het logo uit public/logo/dutchplanes-logo.svg, inline zodat de woordmerk het
 * geladen Archivo gebruikt (een SVG via <img> ziet de webfonts van de pagina
 * niet). De kleur volgt currentColor, dus op een donkere ondergrond volstaat
 * text-paper in plaats van de reversed-versie.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 100"
      role="img"
      aria-label="Dutchplanes"
      className={className}
      fill="currentColor"
    >
      <g transform="translate(6,10) scale(1.25)">
        <polygon points="32,10 35,44 32,55 29,44" />
        <polygon points="29,28 6,42 31,36" />
        <polygon points="35,28 58,42 33,36" />
        <polygon points="30,46 20,54 31,50" />
        <polygon points="34,46 44,54 33,50" />
      </g>
      <g transform="translate(112,63) scale(0.82,1)">
        <text
          x="0"
          y="0"
          fontFamily="var(--font-archivo), 'Helvetica Neue', Arial, sans-serif"
          fontWeight="800"
          fontSize="46"
          letterSpacing="0.5"
        >
          DUTCHPLANES
        </text>
      </g>
    </svg>
  );
}
