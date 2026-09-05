"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutRegistrationPaymentAction } from "@/lib/payments/actions";

export function RegistrationPaymentAction({ amountCents }: { amountCents: number | null }) {
  const [phone, setPhone] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);
  const [pending, startTransition] = useTransition();

  function checkout() {
    startTransition(async () => {
      const result = await checkoutRegistrationPaymentAction(needsPhone ? phone : undefined);
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

  if (amountCents === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Jumlah yuran pendaftaran akan dipaparkan selepas konfigurasi akaun anda lengkap.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {needsPhone ? (
        <div className="grid gap-1.5">
          <label htmlFor="registration-payment-phone" className="text-sm font-medium">
            Nombor telefon untuk pembayaran
          </label>
          <Input
            id="registration-payment-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01X-XXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
          <p className="text-xs text-muted-foreground">
            ToyyibPay memerlukan nombor telefon untuk menjana bil pembayaran.
          </p>
        </div>
      ) : null}
      <Button type="button" onClick={checkout} disabled={pending || (needsPhone && !phone.trim())}>
        {pending ? "Menyediakan bayaran…" : `Bayar yuran · ${formatCurrency(amountCents)}`}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        Anda akan dibawa ke laman pembayaran ToyyibPay. Status sebenar akan dikemas kini selepas pembayaran disahkan.
      </p>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
}
