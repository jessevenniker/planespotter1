import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
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
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4">
            <Link href="/" className="self-center text-ink no-underline">
              <Logo className="h-8 w-auto sm:h-9" />
            </Link>
            <nav aria-label="Hoofdmenu">
              <ul className="flex gap-6 text-sm">
                <li>
                  <Link href="/" className="text-ink no-underline">
                    Log
                  </Link>
                </li>
                <li>
                  <Link href="/over" className="text-ink no-underline">
                    Over
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-5 py-6 text-sm text-ink/70">
            <p>Alle foto&apos;s gemaakt op Amsterdam Airport Schiphol.</p>
            <a href={SITE.instagram}>Instagram</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
