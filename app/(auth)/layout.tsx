import Link from "next/link";

import { Logo } from "@/components/marc/logo";

/**
 * Susun atur dua panel untuk setiap skrin auth.
 *
 * Panel jenama menggunakan NAVY (`brandNavy`, #223145) dan bukan merah
 * jenama. Merah ialah warna TINDAKAN dalam sistem ini - butang utama,
 * cincin fokus; satu panel penuh dengannya menenggelamkan butang yang
 * sepatutnya menonjol, dan wordmark putih memang dilukis untuk duduk
 * atas navy (lihat `marc-wordmark-putih.png`).
 *
 * Panel disembunyikan di bawah `lg` dan bukan disusun di atas borang:
 * pada telefon ia akan menolak medan pertama ke bawah lipatan, yang
 * bermakna skrin log masuk dibuka dengan menunjukkan hiasan dan bukan
 * tempat untuk menaip.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-navy text-brand-navy-foreground lg:flex lg:flex-col lg:justify-between lg:p-10">
        {/*
          Latar dilukis dengan gradien dan bukan imej: tiada permintaan
          rangkaian tambahan pada skrin yang mesti dimuatkan pantas, dan
          tiada aset yang perlu diselaraskan bila palet jenama berubah.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 12%, white 0 1px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Semburan merah jenama - satu-satunya merah pada panel ini,
            cukup untuk mengikat navy kepada jata tanpa bersaing dengan
            butang utama di sebelah kanan. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-32 size-[26rem] rounded-full bg-brand-red/20 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <Logo varian="jata" className="h-12 w-12" priority />
            <div>
              <p className="text-lg font-semibold tracking-[0.2em]">MARC</p>
              <p className="mt-1 text-[10px] tracking-[0.16em] text-brand-navy-foreground/55 uppercase">
                Kelab Sukan dan Rekreasi MAIWP
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <p className="font-heading text-[1.75rem] leading-snug font-semibold tracking-tight text-balance">
            Satu akaun untuk aktiviti, keahlian dan sijil anda.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-brand-navy-foreground/65">
            Dibangunkan oleh Hafiz, bekas pelajar Kompleks Darul Kifayah,
            MAIWP, secara sukarela untuk membantu kelab dan ahli MARC.
          </p>
        </div>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <Logo varian="jata" className="h-14 w-14" priority />
            <span className="text-lg font-semibold tracking-[0.2em]">MARC</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
