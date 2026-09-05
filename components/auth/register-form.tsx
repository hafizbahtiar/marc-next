"use client";

import Link from "next/link";
import { useActionState } from "react";
import { InfoIcon } from "lucide-react";

import { SubmitButton } from "@/components/auth/submit-button";
import { FormField } from "@/components/auth/form-field";
import { Notice } from "@/components/auth/notice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { daftarAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function RegisterForm() {
  const [keadaan, action] = useActionState(daftarAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notice ralat={keadaan.ralat} />

      <Alert className="border-primary/20 bg-primary/5">
        <InfoIcon className="text-primary" aria-hidden />
        <div>
          <AlertTitle>Sebelum mendaftar</AlertTitle>
          <AlertDescription className="mt-1">
            Gunakan emel kekal kerana emel sekali guna daripada lebih 8,000
            domain disekat. Nombor staf akan disahkan oleh pengurusan, manakala
            nombor telefon diperlukan untuk bayaran yuran.
          </AlertDescription>
        </div>
      </Alert>

      <FormField
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

      <FormField
        name="staff_id"
        label="Nombor staf"
        autoComplete="off"
        defaultValue={keadaan.nilai?.staff_id}
        ralat={keadaan.medan?.staff_id}
        required
      />

      <FormField
        name="phone"
        label="Nombor telefon"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="012-345 6789"
        defaultValue={keadaan.nilai?.phone}
        ralat={keadaan.medan?.phone}
        required
      />

      <FormField
        name="password"
        label="Kata laluan"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.password}
        petunjuk="Sekurang-kurangnya 6 aksara."
        required
      />

      <FormField
        name="sahkan_password"
        label="Sahkan kata laluan"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.sahkan_password}
        required
      />

      <SubmitButton>Daftar akaun</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Sudah ada akaun?{" "}
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
