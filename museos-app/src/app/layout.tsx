import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

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
  title: "Museos de España | Mapa de 6.590 museos y colecciones",
  description: "Todos los museos de España en un mapa: horarios, precios, fotos, visitas virtuales y fichas oficiales del Directorio de Museos. Busca por comunidad, provincia o temática.",
  keywords: ["museos", "españa", "cultura", "arte", "mapa", "colecciones", "visita virtual"],
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
      </body>
    </html>
  );
}
