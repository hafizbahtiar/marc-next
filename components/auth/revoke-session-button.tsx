"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { batalkanSesiAction } from "@/lib/auth/actions";

export function RevokeSessionButton({ id }: { id: string }) {
  const [error, setError] = useState<string>();

  return (
    <div className="shrink-0 text-right">
      <ConfirmationDialog
        title="Log keluar sesi ini?"
        description="Device ini tidak lagi mempunyai akses ke akaun anda."
        confirmLabel="Log keluar"
        trigger={<Button type="button" variant="ghost" size="sm">Log keluar</Button>}
        onConfirm={async () => {
          const formData = new FormData();
          formData.set("id", id);
          const result = await batalkanSesiAction(KEADAAN_AWAL, formData);
          setError(result.ralat);
          return !result.ralat;
        }}
      />
      {error ? <p role="alert" className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
