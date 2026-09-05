import { Suspense } from "react";
import { ArrowUpRightIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

import { SessionList } from "@/components/auth/session-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isManagement } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";
import { wajibSesi } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { accessToken, profile } = await wajibSesi();

  return (
    <div className="grid gap-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="grid gap-2">
          <p className="text-sm font-medium text-primary">Ruang ahli MARC</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Selamat kembali{profile.display_name ? `, ${profile.display_name}` : ""}.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Semua maklumat keahlian dan sesi peranti anda di satu tempat.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href={ROUTES.profil}>
            Lihat profil
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <CardTitle className="text-base">Ringkasan keahlian</CardTitle>
                <p className="text-sm text-muted-foreground">Maklumat akaun semasa.</p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-success-bg text-success">
                <ShieldCheckIcon className="size-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
            <DataRow label="ID ahli" nilai={profile.member_id ?? "Belum dijana"} />
            <DataRow label="Nombor staf" nilai={profile.staff_id} />
            <DataRow label="Emel" nilai={profile.email} />
            <DataRow label="Telefon" nilai={profile.phone ?? "-"} />
            <DataRow label="Bahagian" nilai={profile.department_name ?? "-"} />
            <DataRow
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
        <Suspense fallback={<SessionsSkeleton />}>
          <SessionList accessToken={accessToken} />
        </Suspense>
      </div>
    </div>
  );
}

function DataRow({ label, nilai }: { label: string; nilai: React.ReactNode }) {
  return (
    <div className="border-b border-border/70 pb-2.5 last:border-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{nilai}</dd>
    </div>
  );
}

function SessionsSkeleton() {
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
