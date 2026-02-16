import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ThemeProvider from "@/components/theme/ThemeProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Museos de Espa\u00f1a | Plataforma Interactiva",
  description: "Explora m\u00e1s de 1.500 museos y colecciones de Espa\u00f1a. Mapa interactivo, b\u00fasqueda avanzada, pasaporte cultural y estad\u00edsticas.",
  keywords: ["museos", "espa\u00f1a", "cultura", "arte", "mapa", "colecciones"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased min-h-screen transition-colors duration-300 bg-slate-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100`}>
        <ThemeProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
