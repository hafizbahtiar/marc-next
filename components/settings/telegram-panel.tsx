"use client";

import { useState, useTransition } from "react";
import { CheckIcon, Link2Icon, SendIcon, UnlinkIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { generateTelegramLinkAction, unlinkTelegramAction } from "@/lib/profil/settings-actions";

export function TelegramPanel({
  linked,
  username,
}: {
  linked: boolean;
  username: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function connect() {
    setError(undefined);
    startTransition(async () => {
      const result = await generateTelegramLinkAction();
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.href = result.deepLink;
      }
    });
  }

  async function disconnect(): Promise<boolean> {
    setError(undefined);
    const result = await unlinkTelegramAction();
    if (result.error) {
      setError(result.error);
      return false;
    }
    window.location.reload();
    return true;
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          {linked ? <CheckIcon className="size-5" /> : <SendIcon className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{linked ? "Disambungkan" : "Belum disambung"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {linked ? (username ? `@${username}` : "Akaun Telegram disambungkan") : "Belum ada akaun Telegram disambungkan"}
          </p>
        </div>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Sambungkan akaun Telegram anda ke MARC untuk ciri notifikasi dan pengesahan yang akan datang.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {linked ? (
        <ConfirmationDialog
          title="Nyahikat Telegram?"
          description="Akaun Telegram tidak lagi dipautkan kepada akaun MARC anda."
          confirmLabel="Nyahikat"
          trigger={<Button type="button" variant="destructive" disabled={pending}><UnlinkIcon className="size-4" /> Nyahikat Telegram</Button>}
          onConfirm={disconnect}
        />
      ) : (
        <Button type="button" variant="default" disabled={pending} onClick={connect}>
          <Link2Icon className="size-4" />
          {pending ? "Memproses…" : "Sambung Telegram"}
        </Button>
      )}
    </div>
  );
}
