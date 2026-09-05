"use client";

import { useState, useTransition } from "react";
import { CheckIcon, Link2Icon, SendIcon, UnlinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { janaPautanTelegramAction, nyahikatTelegramAction } from "@/lib/profil/settings-actions";

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
      const result = await janaPautanTelegramAction();
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.href = result.deepLink;
      }
    });
  }

  function disconnect() {
    setError(undefined);
    startTransition(async () => {
      const result = await nyahikatTelegramAction();
      if (result.error) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    });
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
      <Button
        type="button"
        variant={linked ? "destructive" : "default"}
        disabled={pending}
        onClick={linked ? disconnect : connect}
      >
        {linked ? <UnlinkIcon className="size-4" /> : <Link2Icon className="size-4" />}
        {pending ? "Memproses…" : linked ? "Nyahikat Telegram" : "Sambung Telegram"}
      </Button>
    </div>
  );
}
