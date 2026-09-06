"use client";

import { useState } from "react";
import { UserRoundXIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { requestAccountDeletionAction } from "@/lib/profil/settings-actions";

export function DeleteAccountButton() {
  const [message, setMessage] = useState<string>();

  async function requestDeletion(): Promise<boolean> {
    const result = await requestAccountDeletionAction();
    setMessage(result.success ?? result.error);
    return Boolean(result.success);
  }

  if (message) {
    return <p className="min-h-16 px-4 py-0 flex items-center text-sm text-muted-foreground">{message}</p>;
  }

  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-0">
      <UserRoundXIcon className="size-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-destructive">Padam akaun</p>
        <p className="text-xs text-muted-foreground">
          Hantar permintaan untuk diproses oleh pasukan MARC.
        </p>
      </div>
      <ConfirmationDialog
        title="Minta padam akaun?"
        description="Permintaan akan dihantar kepada pasukan MARC untuk diproses. Tindakan ini tidak boleh dibuat asal semula selepas diluluskan."
        confirmLabel="Minta padam"
        trigger={<Button type="button" size="sm" variant="destructive">Minta padam</Button>}
        onConfirm={requestDeletion}
      />
    </div>
  );
}
