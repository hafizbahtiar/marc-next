"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ButangHantar } from "@/components/auth/butang-hantar";
import { Medan } from "@/components/auth/medan";
import { Notis } from "@/components/auth/notis";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { lupaKataLaluanAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function BorangLupaKataLaluan() {
  const [keadaan, action] = useActionState(lupaKataLaluanAction, KEADAAN_AWAL);

  // Selepas berjaya, borang diganti sepenuhnya dan bukan sekadar diberi
  // notis di atasnya. Backend memadam pautan sebelumnya setiap kali
  // permintaan baharu masuk, jadi membiarkan butang "Hantar" tersedia
  // menggalakkan ahli membatalkan pautan yang baru sahaja dia terima.
  if (keadaan.berjaya) {
    return (
      <div className="grid gap-4">
        <Notis berjaya={keadaan.berjaya} />
        <Link
          href={ROUTES.logMasuk}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Kembali ke log masuk
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notis ralat={keadaan.ralat} />

      <Medan
        name="email"
        label="Emel"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="nama@contoh.com"
        defaultValue={keadaan.nilai?.email}
        ralat={keadaan.medan?.email}
        required
      />

      <ButangHantar>Hantar pautan reset</ButangHantar>

      <p className="text-center text-sm text-muted-foreground">
        Teringat semula?{" "}
        <Link
          href={ROUTES.logMasuk}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Log masuk
        </Link>
      </p>
    </form>
  );
}
