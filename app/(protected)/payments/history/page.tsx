import { CreditCardIcon } from "lucide-react";

import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { BackLink } from "@/components/ui/back-link";
import { wajibSesi } from "@/lib/auth/session";
import { getPaymentHistory } from "@/lib/payments/api";

export default async function PaymentHistoryPage() {
  const { accessToken } = await wajibSesi();
  const history = await getPaymentHistory(accessToken);
  const empty =
    history.registration_fee.length === 0 &&
    history.activity_fees.length === 0 &&
    history.donations.length === 0 &&
    !history.outstanding_registration_fee;

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <CreditCardIcon className="size-4" />
          Kewangan
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Sejarah Bayaran Saya</h1>
      </header>
      {empty ? (
        <p className="rounded-xl border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          Tiada sejarah bayaran.
        </p>
      ) : (
        <div className="grid gap-5">
          {history.outstanding_registration_fee ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              Yuran pendaftaran belum dibayar.
            </div>
          ) : null}
          <PaymentHistoryTable history={history} />
        </div>
      )}
    </div>
  );
}
