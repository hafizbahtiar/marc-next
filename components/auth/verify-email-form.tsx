"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { Notice } from "@/components/auth/notice";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { sahkanEmelAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";

export function VerifyEmailForm({ token }: { token: string }) {
  const [keadaan, action] = useActionState(sahkanEmelAction, KEADAAN_AWAL);

  if (keadaan.berjaya) {
    return (
      <div className="grid gap-4">
        <Notice berjaya={keadaan.berjaya} />
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
      <Notice ralat={keadaan.ralat} />
      <input type="hidden" name="token" value={token} />
      <SubmitButton>Sahkan emel saya</SubmitButton>
    </form>
  );
}
