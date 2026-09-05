import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { LangkahStatus, type KeadaanLangkah } from "@/components/marc/langkah-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/auth/routes";
import { dapatkanSesi } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Menunggu kelulusan" };

export default async function MenungguKelulusanPage() {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect(ROUTES.tamatSesi);

  const p = sesi.profile;
  // Halaman ini ialah destinasi gate untuk status `pending` SAHAJA.
  // Apabila pengurusan meluluskan akaun, lawatan seterusnya mesti jatuh
  // ke tempatnya yang betul dan bukan tersangkut pada skrin menunggu.
  if (p.status !== "pending") redirect(ROUTES.utama);

  const bayaran = p.registration_payment_status;
  const keadaanBayaran: KeadaanLangkah =
    bayaran === "succeeded" ? "selesai" : bayaran === "failed" ? "gagal" : "menunggu";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <Badge variant="secondary" className="mb-3">
          Menunggu kelulusan
        </Badge>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Akaun anda sedang disemak
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Pihak pengurusan MARC akan menyemak butiran anda sebelum akses penuh
          dibuka. Anda akan dimaklumkan melalui emel apabila keputusan dibuat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kemajuan keahlian</CardTitle>
          <CardDescription>Langkah yang masih menunggu ditanda di bawah.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="mt-1">
            <LangkahStatus
              keadaan="selesai"
              tajuk="Akaun dicipta"
              perihal={p.email}
            />

            <LangkahStatus
              keadaan={p.email_verified ? "selesai" : "menunggu"}
              tajuk="Emel disahkan"
              perihal={
                p.email_verified ? (
                  "Alamat emel anda telah disahkan."
                ) : (
                  <>
                    Belum disahkan. Pautan pengesahan boleh diminta semula
                    selepas akaun anda diluluskan.
                  </>
                )
              }
            />

            <LangkahStatus
              keadaan={p.staff_id_verified_at ? "selesai" : "menunggu"}
              tajuk="Nombor staf disahkan"
              perihal={
                p.staff_id_verified_at
                  ? `Nombor staf ${p.staff_id} telah disahkan pihak pengurusan.`
                  : `Pihak pengurusan sedang mengesahkan nombor staf ${p.staff_id}. ID ahli anda dijana selepas ini.`
              }
            />

            <LangkahStatus
              keadaan={keadaanBayaran}
              tajuk="Yuran pendaftaran"
              perihal={perihalBayaran(bayaran, p.registration_fee_cents)}
            />

            <LangkahStatus
              keadaan="menunggu"
              tajuk="Kelulusan keahlian"
              perihal="Langkah terakhir. Pihak pengurusan akan meluluskan akaun anda setelah semua di atas lengkap."
              akhir
            />
          </ol>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Butiran anda tersalah?{" "}
        <Link
          href={ROUTES.logMasuk}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Hubungi pihak pengurusan MARC
        </Link>{" "}
        untuk pembetulan.
      </p>
    </div>
  );
}

function perihalBayaran(status: string | null, feeCents: number | null): string {
  const yuran = feeCents == null ? null : formatRinggit(feeCents);

  switch (status) {
    case "succeeded":
      return "Yuran pendaftaran telah diterima.";
    case "failed":
      return yuran
        ? `Pembayaran terakhir tidak berjaya. Yuran pendaftaran ialah ${yuran}. Cuba semula melalui aplikasi MARC.`
        : "Pembayaran terakhir tidak berjaya. Cuba semula melalui aplikasi MARC.";
    case "pending":
      return "Pembayaran anda sedang diproses. Status akan dikemas kini secara automatik.";
    default:
      return yuran
        ? `Yuran pendaftaran ${yuran} belum dibayar. Pembayaran boleh dibuat melalui aplikasi MARC.`
        : "Yuran pendaftaran belum dibayar.";
  }
}

/** Backend menyimpan jumlah dalam SEN — bahagi 100 sebelum dipapar. */
function formatRinggit(cents: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
}
