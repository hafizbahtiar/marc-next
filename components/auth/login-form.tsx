"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { FormField } from "@/components/auth/form-field";
import { Notice } from "@/components/auth/notice";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { logMasukAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function LoginForm({ next }: { next: string }) {
  const [keadaan, action] = useActionState(logMasukAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notice ralat={keadaan.ralat} />

      {/*
        Destinasi dibawa dalam medan tersembunyi dan bukan dibaca semula
        daripada URL di dalam tindakan: tindakan pelayan tak nampak URL
        halaman yang memanggilnya.
      */}
      <input type="hidden" name="next" value={next} />

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

      <div className="grid gap-1.5">
        <FormField
          name="password"
          label="Kata laluan"
          type="password"
          autoComplete="current-password"
          ralat={keadaan.medan?.password}
          required
        />
        <Link
          href={ROUTES.lupaKataLaluan}
          className="justify-self-end text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Lupa kata laluan?
        </Link>
      </div>

      <SubmitButton>Log masuk</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Belum ada akaun?{" "}
        <Link
          href={ROUTES.daftar}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
