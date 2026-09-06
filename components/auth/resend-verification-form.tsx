"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { Notice } from "@/components/auth/notice";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { hantarSemulaPengesahanAction } from "@/lib/auth/actions";

export function ResendVerificationForm() {
  const [keadaan, action] = useActionState(hantarSemulaPengesahanAction, KEADAAN_AWAL);

  return (
    <form action={action} className="grid gap-4">
      <Notice ralat={keadaan.ralat} berjaya={keadaan.berjaya} />
      {/*
        Backend mengehadkan satu emel setiap 60 saat dan 5 setiap 24 jam
        setiap akaun, dan menjawab 429 dengan mesej Bahasa Melayunya
        sendiri. Tiada pemasa kiraan menurun disalin di sini - ia akan
        menjadi salinan kedua peraturan itu yang boleh hanyut, dan mesej
        backend sudah pun memberitahu ahli apa yang perlu dibuat.
      */}
      <SubmitButton className="h-10 w-full rounded-md text-sm sm:w-auto sm:px-5">
        Hantar semula emel pengesahan
      </SubmitButton>
    </form>
  );
}
