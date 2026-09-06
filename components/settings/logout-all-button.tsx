"use client";

import { LogOutIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { logKeluarSemuaAction } from "@/lib/auth/actions";

export function LogoutAllButton() {
  return (
    <div className="flex min-h-16 items-center justify-between px-4 py-0">
      <span className="flex items-center gap-2 text-sm text-destructive">
        <LogOutIcon className="size-4" />
        Log keluar semua peranti
      </span>
      <ConfirmationDialog
        title="Log keluar semua peranti?"
        description="Semua sesi aktif anda akan ditamatkan, termasuk device lain."
        confirmLabel="Log keluar semua"
        trigger={<Button size="sm" variant="destructive">Log keluar</Button>}
        onConfirm={async () => {
          await logKeluarSemuaAction();
        }}
      />
    </div>
  );
}
