"use client";

import { LogOutIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { logKeluarAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-0">
      <span className="flex items-center gap-2 text-sm font-medium">
        <LogOutIcon className="size-4 text-destructive" />
        Log keluar device ini
      </span>
      <ConfirmationDialog
        title="Log keluar device ini?"
        description="Sesi pada device ini akan ditamatkan."
        confirmLabel="Log keluar"
        trigger={<Button size="sm" variant="outline" className="text-destructive">Log keluar</Button>}
        onConfirm={async () => {
          await logKeluarAction();
        }}
      />
    </div>
  );
}
