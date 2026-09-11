import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { SITE_DESCRIPCION, SITE_NAME, SITE_TITULO, SITE_URL } from "@/lib/site";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: SITE_TITULO, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPCION,
  keywords: ["muselisto", "museos", "españa", "cultura", "arte", "mapa", "colecciones", "visita virtual"],
  openGraph: { siteName: SITE_NAME, locale: "es_ES", type: "website", title: SITE_TITULO, description: SITE_DESCRIPCION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${figtree.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-white text-neutral-900`}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
