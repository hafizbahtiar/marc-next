import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/auth/routes";
import { dapatkanSesi } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Permohonan ditolak" };

export default async function AkaunDitolakPage() {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect(ROUTES.tamatSesi);

  const p = sesi.profile;
  if (p.status !== "rejected") redirect(ROUTES.utama);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <Badge variant="secondary" className="mb-3 text-destructive">
          Permohonan ditolak
        </Badge>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Permohonan keahlian anda tidak diluluskan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Pihak pengurusan MARC telah menyemak permohonan anda dan tidak dapat
          meluluskannya buat masa ini.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Butiran permohonan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Baris label="Emel" nilai={p.email} />
          <Baris label="Nombor staf" nilai={p.staff_id} />
          <Baris label="Nombor telefon" nilai={p.phone ?? "—"} />
        </CardContent>
      </Card>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground text-pretty">
        Jika anda percaya ini satu kesilapan — contohnya nombor staf yang
        tersalah taip — hubungi pihak pengurusan MARC dengan butiran di atas.
        Mereka boleh menyemak semula permohonan anda.
      </p>
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{nilai}</dd>
    </div>
  );
}
