"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { batalkanSesiAction } from "@/lib/auth/actions";

function Butang() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? "Melog keluar…" : "Log keluar"}
    </Button>
  );
}

export function ButangBatalSesi({ id }: { id: string }) {
  const [keadaan, action] = useActionState(batalkanSesiAction, KEADAAN_AWAL);

  return (
    <form action={action} className="shrink-0 text-right">
      <input type="hidden" name="id" value={id} />
      <Butang />
      {keadaan.ralat ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {keadaan.ralat}
        </p>
      ) : null}
    </form>
  );
}
