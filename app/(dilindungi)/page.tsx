import { Suspense } from "react";

import { SenaraiSesi } from "@/components/auth/senarai-sesi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function UtamaPage() {
  const { accessToken, profile } = await wajibSesi();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Selamat kembali{profile.display_name ? `, ${profile.display_name}` : ""}.
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Akaun anda aktif dan disahkan.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keahlian</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Baris label="ID ahli" nilai={profile.member_id ?? "Belum dijana"} />
            <Baris label="Nombor staf" nilai={profile.staff_id} />
            <Baris label="Emel" nilai={profile.email} />
            <Baris label="Telefon" nilai={profile.phone ?? "—"} />
            <Baris label="Bahagian" nilai={profile.department_name ?? "—"} />
            <Baris
              label="Peranan"
              nilai={
                <span className="flex items-center gap-2">
                  {profile.role_name}
                  {isManagement(profile) ? (
                    <Badge variant="secondary" className="text-primary">
                      Pengurusan
                    </Badge>
                  ) : null}
                </span>
              }
            />
          </dl>
        </CardContent>
      </Card>

      {/*
        Senarai sesi ialah panggilan rangkaian KEDUA (GET /me/sessions)
        selepas GET /me yang sudah dibuat oleh susun atur. Ia dibungkus
        dalam Suspense supaya bahagian halaman yang datang daripada
        profil dipaparkan serta-merta dan bukan menunggu permintaan ini.
      */}
      <Suspense fallback={<RangkaSesi />}>
        <SenaraiSesi accessToken={accessToken} />
      </Suspense>
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: React.ReactNode }) {
  return (
    <div className="border-b border-border/70 pb-2.5 last:border-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{nilai}</dd>
    </div>
  );
}

function RangkaSesi() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peranti yang log masuk</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
