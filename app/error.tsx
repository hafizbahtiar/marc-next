"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Logo } from "@/components/marc/logo";
import { Button } from "@/components/ui/button";

/**
 * Sempadan ralat terakhir. Kegagalan yang boleh dijangka sudah dikendalikan
 * lebih awal - 401 mengubah hala ke log masuk, backend yang tak dapat
 * dihubungi mengubah hala ke /pelayan-luar-talian - jadi apa yang sampai
 * ke sini ialah sesuatu yang tak dijangka.
 *
 * `error.message` SENGAJA tak dipaparkan: dalam binaan produksi Next
 * menyunting mesej ralat pelayan kepada teks generik, jadi memaparkannya
 * hanya menambah bunyi. `digest` diberi supaya ahli boleh memetiknya
 * apabila melaporkan masalah.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <Logo varian="penuh" className="mb-10 h-24" />

      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground"
      >
        <TriangleAlertIcon className="size-5" />
      </span>

      <h1 className="font-heading mt-5 text-xl font-semibold tracking-tight text-balance">
        Ada sesuatu yang tak kena
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
        Ralat tak dijangka berlaku. Cuba sekali lagi - kalau ia berulang,
        laporkan kepada pihak pengurusan MARC.
      </p>

      <Button onClick={reset} className="mt-6 h-10 rounded-md px-5">
        Cuba lagi
      </Button>

      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Rujukan: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
