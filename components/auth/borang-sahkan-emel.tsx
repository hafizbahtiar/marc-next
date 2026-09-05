"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ButangHantar } from "@/components/auth/butang-hantar";
import { Notis } from "@/components/auth/notis";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { sahkanEmelAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function BorangSahkanEmel({ token }: { token: string }) {
  const [keadaan, action] = useActionState(sahkanEmelAction, KEADAAN_AWAL);

  if (keadaan.berjaya) {
    return (
      <div className="grid gap-4">
        <Notis berjaya={keadaan.berjaya} />
        <Link
          href={ROUTES.utama}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Teruskan ke MARC
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <Notis ralat={keadaan.ralat} />
      <input type="hidden" name="token" value={token} />
      <ButangHantar>Sahkan emel saya</ButangHantar>
    </form>
  );
}
