"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutRegistrationPaymentAction } from "@/lib/payments/actions";

export function RegistrationPaymentAction({
  amountCents,
  gatewayChargeCents = 0,
}: {
  amountCents: number | null;
  gatewayChargeCents?: number;
}) {
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
      <div className="rounded-xl border bg-muted/20 p-4">
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Yuran pendaftaran</dt>
            <dd className="font-medium">{formatCurrency(amountCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Caj pemprosesan (anggaran)</dt>
            <dd className="font-medium">{formatCurrency(gatewayChargeCents)}</dd>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold">Jumlah anggaran</dt>
            <dd className="font-semibold">{formatCurrency(amountCents + gatewayChargeCents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Pecahan ini ialah anggaran. Jumlah akhir dan kaedah bayaran akan disahkan di halaman ToyyibPay.
        </p>
      </div>
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
