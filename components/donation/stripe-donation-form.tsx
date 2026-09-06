"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDonationCheckoutAction } from "@/lib/donations/actions";

const QUICK_AMOUNTS = [10, 20, 50, 100];

export function StripeDonationForm({ publishableKey }: { publishableKey: string }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  const [amount, setAmount] = useState("20");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("payment_intent_client_secret");
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amountCents = amount === "custom"
    ? Math.round(Number(customAmount) * 100)
    : Number(amount) * 100;

  function startCheckout() {
    setError(null);
    if (!Number.isFinite(amountCents) || amountCents < 100) {
      setError("Masukkan jumlah sumbangan sekurang-kurangnya RM1.");
      return;
    }
    if (!donorEmail.trim()) {
      setError("Emel diperlukan untuk menerima pengesahan bayaran.");
      return;
    }

    startTransition(async () => {
      const result = await createDonationCheckoutAction({
        amount_cents: amountCents,
        donor_name: donorName,
        donor_email: donorEmail,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setClientSecret(result.data.clientSecret);
    });
  }

  if (!publishableKey) {
    return (
      <Alert>
        <AlertTitle>Pembayaran kad belum tersedia</AlertTitle>
        <AlertDescription>
          Anda masih boleh menyumbang melalui DuitNow QR di bawah.
        </AlertDescription>
      </Alert>
    );
  }

  if (clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: { colorPrimary: "#e21e28", borderRadius: "12px" },
          },
        }}
      >
        <StripePaymentStep amountCents={amountCents} onBack={() => setClientSecret(null)} />
      </Elements>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-base">Sumbang melalui kad</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Bayaran diproses dengan selamat oleh Stripe. MARC tidak menyimpan maklumat kad anda.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="grid gap-3">
          <Label>Jumlah sumbangan</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUICK_AMOUNTS.map((value) => (
              <Button
                key={value}
                type="button"
                variant={amount === String(value) ? "default" : "outline"}
                onClick={() => setAmount(String(value))}
              >
                RM{value}
              </Button>
            ))}
          </div>
          <Button type="button" variant={amount === "custom" ? "secondary" : "outline"} onClick={() => setAmount("custom")}>
            Jumlah lain
          </Button>
          {amount === "custom" ? (
            <div className="grid gap-2">
              <Label htmlFor="donation-custom-amount">Jumlah (RM)</Label>
              <Input
                id="donation-custom-amount"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder="Contoh: 25"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="donation-name">Nama (pilihan)</Label>
            <Input id="donation-name" value={donorName} onChange={(event) => setDonorName(event.target.value)} placeholder="Nama anda" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="donation-email">Emel</Label>
            <Input id="donation-email" type="email" required value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} placeholder="anda@contoh.com" />
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Pembayaran tidak dapat dimulakan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="button" onClick={startCheckout} disabled={pending}>
          {pending ? "Menyediakan pembayaran…" : `Teruskan - RM${(amountCents / 100).toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}

function StripePaymentStep({ amountCents, onBack }: { amountCents: number; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "succeeded">("idle");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!stripe) return;
    const secret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (!secret) return;

    void stripe.retrievePaymentIntent(secret).then(({ paymentIntent }) => {
      if (paymentIntent?.status === "succeeded") setStatus("succeeded");
      if (paymentIntent?.status === "processing") setStatus("processing");
      window.history.replaceState({}, "", window.location.pathname);
    });
  }, [stripe]);

  async function pay() {
    if (!stripe || !elements) return;
    setError(null);
    setPending(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Bayaran tidak berjaya. Cuba lagi.");
      return;
    }
    if (result.paymentIntent?.status === "succeeded") setStatus("succeeded");
    if (result.paymentIntent?.status === "processing") setStatus("processing");
  }

  if (status !== "idle") {
    return (
      <Card>
        <CardContent className="grid gap-4 p-6">
          <Alert>
            <AlertTitle>{status === "succeeded" ? "Sumbangan berjaya" : "Bayaran sedang diproses"}</AlertTitle>
            <AlertDescription>
              {status === "succeeded"
                ? "Terima kasih kerana menyokong MARC. Pengesahan akan dihantar ke emel anda."
                : "Stripe masih mengesahkan bayaran anda. Anda boleh menyemak status dalam sejarah bayaran."}
            </AlertDescription>
          </Alert>
          <Button type="button" variant="outline" onClick={onBack}>Buat sumbangan lain</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-base">Bayar RM{(amountCents / 100).toFixed(2)}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <PaymentElement />
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Bayaran gagal</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={pending}>Kembali</Button>
          <Button type="button" onClick={pay} disabled={pending || !stripe || !elements}>
            {pending ? "Memproses…" : "Bayar sekarang"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
