"use client";

import { useFormStatus } from "react-dom";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logKeluarAction } from "@/lib/auth/actions";

function Butang() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      <LogOutIcon aria-hidden />
      {pending ? "Melog keluar…" : "Log keluar"}
    </Button>
  );
}

export function ButangLogKeluar() {
  // Log keluar ialah borang POST dan bukan pautan: tindakan pelayan Next
  // membawa perlindungan asal-usulnya sendiri, jadi tapak lain tak boleh
  // memacunya. `<a href>` boleh dicetuskan oleh mana-mana halaman yang
  // memuatkan satu imej.
  return (
    <form action={logKeluarAction}>
      <Butang />
    </form>
  );
}
