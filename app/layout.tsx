import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { RandomButton } from "@/components/EntryControls";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { SITE, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: SITE.locale },
  // Machineleesbaar voorbehoud tegen tekst- en datamining (art. 15o Aw).
  other: {
    "tdm-reservation": "1",
    "tdm-policy": `${SITE.url}/privacy-en-auteursrecht#tekst-en-datamining`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${archivo.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <header className="border-b border-ink">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
            <Link href="/" className="text-ink no-underline">
              <Logo className="h-8 w-auto sm:h-9" />
            </Link>
            <RandomButton className="bg-plate px-2 py-0.5 text-sm text-ink hover:bg-ink hover:text-paper md:order-last" />
            {/* Op mobiel één rij die horizontaal scrollt, op desktop naast het logo. */}
            <nav aria-label="Hoofdmenu" className="-mx-5 w-[calc(100%+2.5rem)] overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:ml-auto md:w-auto md:px-0">
              <ul className="flex items-center gap-x-5 whitespace-nowrap text-sm">
                {[
                  ["/", "Log"],
                  ["/dag", "Dagen"],
                  ["/maatschappij", "Maatschappijen"],
                  ["/statistieken", "Cijfers"],
                  ["/bijzonder", "Bijzonder"],
                  ["/over", "Over"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink no-underline hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-5 py-6 text-sm text-ink/70">
            <p>
              Alle foto&apos;s gemaakt op Amsterdam Airport Schiphol. &copy;{" "}
              {SITE.legalName}
            </p>
            <ul className="flex gap-6">
              <li>
                <Link href="/privacy-en-auteursrecht">
                  Privacy en auteursrecht
                </Link>
              </li>
              <li>
                <a href={SITE.instagram}>Instagram</a>
              </li>
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
