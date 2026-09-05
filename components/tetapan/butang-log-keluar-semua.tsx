"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logKeluarSemuaAction } from "@/lib/auth/actions";

/**
 * Dua-langkah dalam-baris (bukan modal) — padanan corak padam post
 * (KadPos, modul feed): klik pertama sedia, klik kedua sahkan.
 */
export function ButangLogKeluarSemua() {
  const [sahkan, setSahkan] = useState(false);

  if (!sahkan) {
    return (
      <button
        type="button"
        onClick={() => setSahkan(true)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
      >
        <span className="flex items-center gap-2">
          <LogOutIcon className="size-4" />
          Log keluar semua peranti
        </span>
      </button>
    );
  }

  return (
    <form action={logKeluarSemuaAction} className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">Log keluar SEMUA peranti?</span>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setSahkan(false)}>
          Batal
        </Button>
        <ButangSahkan />
      </div>
    </form>
  );
}

function ButangSahkan() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      {pending ? "Melog keluar…" : "Sahkan"}
    </Button>
  );
}
