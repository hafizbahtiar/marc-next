"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ButangHantar } from "@/components/auth/butang-hantar";
import { Medan } from "@/components/auth/medan";
import { Notis } from "@/components/auth/notis";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { daftarAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function BorangDaftar() {
  const [keadaan, action] = useActionState(daftarAction, KEADAAN_AWAL);

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
        petunjuk="Guna emel kekal — emel sekali guna akan ditolak."
        required
      />

      <Medan
        name="staff_id"
        label="Nombor staf"
        autoComplete="off"
        defaultValue={keadaan.nilai?.staff_id}
        ralat={keadaan.medan?.staff_id}
        petunjuk="Pihak pengurusan akan sahkan nombor ini sebelum ID ahli anda dijana."
        required
      />

      <Medan
        name="phone"
        label="Nombor telefon"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="012-345 6789"
        defaultValue={keadaan.nilai?.phone}
        ralat={keadaan.medan?.phone}
        petunjuk="Nombor mudah alih Malaysia. Diperlukan untuk pembayaran yuran."
        required
      />

      <Medan
        name="password"
        label="Kata laluan"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.password}
        petunjuk="Sekurang-kurangnya 6 aksara."
        required
      />

      <Medan
        name="sahkan_password"
        label="Sahkan kata laluan"
        type="password"
        autoComplete="new-password"
        ralat={keadaan.medan?.sahkan_password}
        required
      />

      <ButangHantar>Daftar akaun</ButangHantar>

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
