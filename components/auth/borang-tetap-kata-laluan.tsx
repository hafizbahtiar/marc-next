"use client";

import { useActionState } from "react";

import { ButangHantar } from "@/components/auth/butang-hantar";
import { Medan } from "@/components/auth/medan";
import { Notis } from "@/components/auth/notis";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { tetapKataLaluanAction } from "@/lib/auth/actions";

export function BorangTetapKataLaluan({ token }: { token: string }) {
  const [keadaan, action] = useActionState(tetapKataLaluanAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notis ralat={keadaan.ralat} />

      <input type="hidden" name="token" value={token} />

      <Medan
        name="password"
        label="Kata laluan baharu"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.password}
        petunjuk="Sekurang-kurangnya 6 aksara."
        required
        autoFocus
      />

      <Medan
        name="sahkan_password"
        label="Sahkan kata laluan baharu"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.sahkan_password}
        required
      />

      <ButangHantar>Tetapkan kata laluan</ButangHantar>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Menukar kata laluan akan melog keluar akaun anda daripada semua
        peranti, termasuk aplikasi mudah alih.
      </p>
    </form>
  );
}
