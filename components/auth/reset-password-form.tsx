"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { FormField } from "@/components/auth/form-field";
import { Notice } from "@/components/auth/notice";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { tetapKataLaluanAction } from "@/lib/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [keadaan, action] = useActionState(tetapKataLaluanAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notice ralat={keadaan.ralat} />

      <input type="hidden" name="token" value={token} />

      <FormField
        name="password"
        label="Kata laluan baharu"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.password}
        petunjuk="Sekurang-kurangnya 6 aksara."
        required
        autoFocus
      />

      <FormField
        name="sahkan_password"
        label="Sahkan kata laluan baharu"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.sahkan_password}
        required
      />

      <SubmitButton>Tetapkan kata laluan</SubmitButton>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Menukar kata laluan akan melog keluar akaun anda daripada semua
        peranti, termasuk aplikasi mudah alih.
      </p>
    </form>
  );
}
