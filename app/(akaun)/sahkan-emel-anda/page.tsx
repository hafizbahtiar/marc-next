import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MailIcon } from "lucide-react";

import { BorangHantarSemulaPengesahan } from "@/components/auth/borang-hantar-semula-pengesahan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/auth/routes";
import { dapatkanSesi } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sahkan emel anda" };

export default async function SahkanEmelAndaPage() {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect(ROUTES.tamatSesi);

  const p = sesi.profile;
  // Halaman ini hanya terpakai kepada ahli yang SUDAH diluluskan tetapi
  // emelnya belum disahkan. Ahli pending mesti melihat skrin kelulusan
  // dahulu — lihat `skrinGate`, dan perhatikan bahawa butang hantar
  // semula di bawah memang akan gagal dengan 403 untuknya.
  if (p.email_verified || p.status !== "approved") redirect(ROUTES.utama);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7 flex items-start gap-4">
        <span
          aria-hidden
          className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"
        >
          <MailIcon className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
            Sahkan emel anda
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Akaun anda telah diluluskan. Satu langkah lagi sebelum anda boleh
            menyertai aktiviti dan melihat hebahan kelab.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pautan pengesahan</CardTitle>
          <CardDescription>
            Kami menghantar pautan pengesahan ke{" "}
            <span className="font-medium text-foreground">{p.email}</span>. Buka
            emel itu dan klik pautannya — ia sah selama 1 jam.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Tak nampak emel itu? Semak folder spam dahulu. Kalau masih tiada,
            minta pautan baharu di bawah — pautan lama akan terbatal.
          </p>
          <BorangHantarSemulaPengesahan />
        </CardContent>
      </Card>
    </div>
  );
}
