"use client";

import { useState, useTransition } from "react";
import { UserRoundXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requestAccountDeletionAction } from "@/lib/profil/settings-actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function requestDeletion() {
    startTransition(async () => {
      const result = await requestAccountDeletionAction();
      setMessage(result.success ?? result.error);
      if (result.success) setConfirming(false);
    });
  }

  if (message && !confirming) {
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
      {!confirming ? (
        <Button type="button" size="sm" variant="destructive" onClick={() => setConfirming(true)}>
          Minta padam
        </Button>
      ) : (
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Batal
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={requestDeletion}>
            {pending ? "Menghantar…" : "Sahkan"}
          </Button>
        </div>
      )}
    </div>
  );
}
