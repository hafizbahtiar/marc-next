"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Activity } from "@/lib/activities/api";
import {
  cancelActivityAction,
  checkoutActivityAction,
  registerActivityAction,
} from "@/lib/activities/actions";
import { canRegister, formatCurrency, getRegistrationBlocker, registrationBlockerLabel } from "@/lib/activities/helpers";

export function ActivityActions({ activity }: { activity: Activity }) {
  const [registered, setRegistered] = useState(activity.is_registered);
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);
  const blocker = getRegistrationBlocker(activity);

  function register() {
    startTransition(async () => {
      const result = await registerActivityAction(activity.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRegistered(true);
      toast.success(activity.fee_cents > 0
        ? "Pendaftaran berjaya. Selesaikan bayaran untuk mengekalkan tempat anda."
        : "Pendaftaran berjaya.");
    });
  }

  function cancel() {
    startTransition(async () => {
      const result = await cancelActivityAction(activity.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRegistered(false);
      toast.success("Pendaftaran dibatalkan.");
    });
  }

  function checkout() {
    startTransition(async () => {
      const result = await checkoutActivityAction(activity.id, phone || undefined);
      if (!result.ok) {
        if (result.code === "phone_required") {
          setNeedsPhone(true);
          return;
        }
        toast.error(result.error);
        return;
      }
      window.location.assign(result.data.redirect_url);
    });
  }

  if (registered && activity.fee_cents > 0) {
    return (
      <div className="grid gap-3">
        {needsPhone ? (
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Nombor telefon untuk bayaran"
            inputMode="tel"
            aria-label="Nombor telefon untuk bayaran"
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={checkout} disabled={pending || (needsPhone && !phone.trim())}>
            {pending ? "Menyediakan bayaran…" : `Bayar ${formatCurrency(activity.fee_cents, activity.currency)}`}
          </Button>
          <ConfirmationDialog
            title="Batal pendaftaran?"
            description="Tempat anda akan dilepaskan dan tindakan ini tidak boleh dibuat asal."
            confirmLabel="Batal pendaftaran"
            trigger={<Button type="button" variant="outline" disabled={pending}>Batal pendaftaran</Button>}
            onConfirm={async () => {
              cancel();
              return true;
            }}
          />
        </div>
      </div>
    );
  }

  if (registered) {
    return (
      <ConfirmationDialog
        title="Batal pendaftaran?"
        description="Tempat anda akan dilepaskan dan tindakan ini tidak boleh dibuat asal."
        confirmLabel="Batal pendaftaran"
        trigger={<Button type="button" variant="outline" disabled={pending}>Batal pendaftaran</Button>}
        onConfirm={async () => {
          cancel();
          return true;
        }}
      />
    );
  }

  const canJoin = canRegister(activity);
  return (
    <div className="grid gap-2">
      <Button type="button" onClick={register} disabled={pending || !canJoin}>
        {pending ? "Mendaftar…" : "Daftar aktiviti"}
      </Button>
      {!canJoin ? (
        <p className="text-center text-xs text-muted-foreground">
          {registrationBlockerLabel(blocker)}
        </p>
      ) : activity.fee_cents > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Aktiviti berbayar: {formatCurrency(activity.fee_cents, activity.currency)}
        </p>
      ) : null}
    </div>
  );
}
