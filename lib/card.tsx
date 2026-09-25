import { ImageResponse } from "next/og";
import { CATEGORIES, Entry, exposureLine, formatSpotted, lightOf } from "./photos";
import { SITE } from "./seo";

// Deelkaarten in de huisstijl: kaartinkt, papier en de gele registratieplaat.
// Ze worden op aanvraag gemaakt en daarna door het CDN bewaard. Foto en
// lettertypen komen van de site zelf, zodat de functie klein blijft.

const INK = "#16202A";
const PAPER = "#E9EAE5";
const PLATE = "#F2C12E";

/** Waar de bestanden staan: de productiedomeinnaam op Vercel, anders de live site. */
export const assetBase = () =>
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : SITE.url;

const get = async (path: string) => {
  const res = await fetch(`${assetBase()}${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.arrayBuffer();
};

let fontsPromise: Promise<ArrayBuffer[]> | null = null;

const fonts = async () => {
  fontsPromise ??= Promise.all([
    get("/fonts/archivo-condensed-bold.ttf"),
    get("/fonts/archivo-regular.ttf"),
    get("/fonts/jetbrains-mono-medium.ttf"),
  ]);
  const [bold, regular, mono] = await fontsPromise;
  return [
    { name: "Archivo", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Archivo", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
};

const photo = async (src: string) =>
  `data:image/jpeg;base64,${Buffer.from(await get(src)).toString("base64")}`;

/** Een dag vers in de browser, een jaar in het CDN: de foto verandert niet meer. */
const CACHE = { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" };

function Wordmark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
      <svg width={size * 1.3} height={size * 1.3} viewBox="0 0 64 64">
        <polygon points="32,10 35,44 32,55 29,44" fill={PAPER} />
        <polygon points="29,28 6,42 31,36" fill={PAPER} />
        <polygon points="35,28 58,42 33,36" fill={PAPER} />
        <polygon points="30,46 20,54 31,50" fill={PAPER} />
        <polygon points="34,46 44,54 33,50" fill={PAPER} />
      </svg>
      <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: size, color: PAPER, letterSpacing: 1 }}>
        DUTCHPLANES
      </span>
    </div>
  );
}

function Plate({ text, size }: { text: string; size: number }) {
  return (
    <span
      style={{
        fontFamily: "Mono",
        fontSize: size,
        background: PLATE,
        color: INK,
        padding: `${size * 0.08}px ${size * 0.3}px`,
      }}
    >
      {text}
    </span>
  );
}

/** Linkafbeelding 1200 × 630: foto vol in beeld, gegevens in een donkere balk eronder. */
export async function entryCard(e: Entry) {
  const img = await photo(e.image.src);
  const exposure = e.camera ? exposureLine(e.camera) : null;
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: INK }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse kent geen next/image */}
        <img src={img} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to top, rgba(22,32,42,0.97) 0%, rgba(22,32,42,0.6) 32%, rgba(22,32,42,0) 55%, rgba(22,32,42,0.55) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 36, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={30} />
          <span style={{ fontFamily: "Mono", fontSize: 22, color: PAPER }}>SCHIPHOL · EHAM</span>
        </div>
        <div style={{ position: "absolute", left: 48, right: 48, bottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {e.registration && <Plate text={e.registration} size={56} />}
            <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 52, color: PAPER }}>
              {e.registration ? e.typeShort : e.type}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "Archivo", fontSize: 34, color: PAPER }}>
              {e.operator ?? CATEGORIES[e.category]}
            </span>
            <span style={{ fontFamily: "Mono", fontSize: 24, color: PLATE }}>
              {[formatSpotted(e.spottedAt), exposure].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts(), headers: CACHE }
  );
}

/** Instagram-story 1080 × 1920: foto bovenin, daaronder het logboekblad. */
export async function storyCard(e: Entry) {
  const img = await photo(e.image.src);
  const light = lightOf(e.sunAltitude);
  const rows: [string, string | null][] = [
    ["Maatschappij", e.operator],
    ["Soort", CATEGORIES[e.category]],
    ["Gespot", formatSpotted(e.spottedAt)],
    ["Licht", light && `${light.label}, zon ${e.sunAltitude}°`],
    ["Belichting", e.camera && exposureLine(e.camera)],
    ["Camera", e.camera?.body ?? null],
  ];
  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: "flex", flexDirection: "column", background: INK, padding: "96px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={40} />
          <span style={{ fontFamily: "Mono", fontSize: 28, color: PAPER }}>EHAM</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse kent geen next/image */}
        <img src={img} alt="" width={936} height={624} style={{ marginTop: 64, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56, gap: 20 }}>
          {e.registration && (
            <div style={{ display: "flex" }}>
              <Plate text={e.registration} size={96} />
            </div>
          )}
          <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 76, color: PAPER, lineHeight: 1.05 }}>
            {e.type}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 44, borderTop: `2px solid rgba(233,234,229,0.25)` }}>
          {rows
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div
                key={label}
                style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `2px solid rgba(233,234,229,0.15)` }}
              >
                <span style={{ fontFamily: "Archivo", fontSize: 32, color: "rgba(233,234,229,0.6)" }}>{label}</span>
                <span style={{ fontFamily: "Mono", fontSize: 32, color: PAPER }}>{value}</span>
              </div>
            ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "Archivo", fontSize: 34, color: PAPER }}>Gespot op Schiphol</span>
          <span style={{ fontFamily: "Mono", fontSize: 30, color: PLATE }}>planespotternederland.nl</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await fonts(), headers: CACHE }
  );
}

/** Algemene kaart voor de homepage en Spotdle. */
export async function siteCard({ title, subtitle, src }: { title: string; subtitle: string; src: string }) {
  const img = await photo(src);
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: INK }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse kent geen next/image */}
        <img src={img} alt="" width={560} height={630} style={{ objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px", width: 640 }}>
          <Wordmark size={32} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 68, color: PAPER, lineHeight: 1.05 }}>{title}</span>
            <span style={{ fontFamily: "Archivo", fontSize: 30, color: "rgba(233,234,229,0.75)", lineHeight: 1.3 }}>{subtitle}</span>
          </div>
          <span style={{ fontFamily: "Mono", fontSize: 26, color: PLATE }}>planespotternederland.nl</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts(), headers: CACHE }
  );
}
