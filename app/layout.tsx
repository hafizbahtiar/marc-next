import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";

import { SkripTemaAwal } from "@/components/marc/skrip-tema-awal";
import "./globals.css";

/**
 * Inter untuk teks, Fraunces untuk tajuk — padanan `AppTheme._build`
 * (marc_flutter), yang menggunakan `GoogleFonts.interTextTheme` dengan
 * `GoogleFonts.fraunces` pada `displaySmall`/`headlineSmall`. Web dan
 * aplikasi mudah alih membaca sebagai produk yang sama.
 */
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MARC", template: "%s · MARC" },
  description: "Portal ahli Kelab Sukan dan Rekreasi MAIWP.",
  // Halaman auth membawa token sekali guna dalam URL (pengesahan emel,
  // reset kata laluan). Mengindeksnya tak berguna dan menjemput crawler
  // untuk menebus token sebelum ahli sempat membukanya.
  robots: { index: false, follow: false },
  icons: { icon: "/marc-jata.png", apple: "/marc-jata.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F7" },
    { media: "(prefers-color-scheme: dark)", color: "#171718" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning` — `SkripTemaAwal` menambah kelas `dark`
    // pada elemen ini sebelum React hidrat, jadi HTML pelayan dan DOM
    // klien memang berbeza di sini dengan sengaja.
    <html
      lang="ms"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <SkripTemaAwal />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
