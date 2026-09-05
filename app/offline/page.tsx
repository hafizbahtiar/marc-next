import type { Metadata } from "next";
import { ServerCrashIcon } from "lucide-react";

import { Logo } from "@/components/marc/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pelayan tidak dapat dihubungi" };

/**
 * Dipaparkan melalui tulis-semula daripada `proxy.ts` apabila backend
 * MARC tak dapat dihubungi semasa memutar token.
 *
 * Halaman ini SENGAJA tidak menyentuh kuki. Sesi ahli masih sah — yang
 * gagal ialah rangkaian antara Next dan Go — jadi satu muat semula
 * selepas backend pulih akan meneruskan sesi yang sama.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <Logo varian="penuh" className="mb-10 h-24" />

      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground"
      >
        <ServerCrashIcon className="size-5" />
      </span>

      <h1 className="font-heading mt-5 text-xl font-semibold tracking-tight text-balance">
        Pelayan MARC tidak dapat dihubungi
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
        Ini biasanya sementara. Anda masih log masuk — cuba muat semula
        sebentar lagi.
      </p>

      <Button asChild className="mt-6 h-10 rounded-md px-5">
        {/*
          `<a>` dan bukan `<Link>` dengan sengaja: halaman ini dicapai
          melalui tulis-semula, jadi navigasi sisi klien akan meminta
          muatan RSC daripada pelayan yang sama yang baru sahaja gagal.
          Muat semula penuh membina semula segalanya daripada awal, dan
          ia berfungsi walaupun JavaScript belum dimuatkan.
        */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Cuba lagi</a>
      </Button>
    </main>
  );
}
