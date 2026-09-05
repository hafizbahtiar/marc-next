"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ButangHantar } from "@/components/auth/butang-hantar";
import { Medan } from "@/components/auth/medan";
import { Notis } from "@/components/auth/notis";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { logMasukAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function BorangLogMasuk({ next }: { next: string }) {
  const [keadaan, action] = useActionState(logMasukAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Notis ralat={keadaan.ralat} />

      {/*
        Destinasi dibawa dalam medan tersembunyi dan bukan dibaca semula
        daripada URL di dalam tindakan: tindakan pelayan tak nampak URL
        halaman yang memanggilnya.
      */}
      <input type="hidden" name="next" value={next} />

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

      <div className="grid gap-1.5">
        <Medan
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

      <ButangHantar>Log masuk</ButangHantar>

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
