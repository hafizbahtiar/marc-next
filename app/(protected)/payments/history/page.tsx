import { CreditCardIcon } from "lucide-react";

import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { wajibSesi } from "@/lib/auth/session";
import { sejarahBayaran } from "@/lib/payments/api";

function amount(cents: number, currency: string) {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

function statusLabel(status: string) {
  if (status === "succeeded" || status === "paid") return "Berjaya";
  if (status === "failed") return "Gagal";
  if (status === "refunded") return "Dikembalikan";
  return "Menunggu";
}

export default async function PaymentHistoryPage() {
  const { accessToken } = await wajibSesi();
  const history = await sejarahBayaran(accessToken);
  const empty =
    history.registration_fee.length === 0 &&
    history.activity_fees.length === 0 &&
    history.donations.length === 0 &&
    !history.outstanding_registration_fee;

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
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
          <PaymentGroup title="Yuran Pendaftaran">
            {history.registration_fee.map((item) => (
              <PaymentRow
                key={item.id}
                title="Yuran pendaftaran"
                amount={amount(item.amount_cents, item.currency)}
                status={item.status}
                date={item.created_at}
              />
            ))}
          </PaymentGroup>
          <PaymentGroup title="Yuran Aktiviti">
            {history.activity_fees.map((item) => (
              <PaymentRow
                key={item.registration_id}
                title={item.title}
                amount={amount(item.fee_cents, item.currency)}
                status={item.payment_status}
                date={item.starts_at}
              />
            ))}
          </PaymentGroup>
          <PaymentGroup title="Sokongan">
            {history.donations.map((item) => (
              <PaymentRow
                key={item.id}
                title="Sokongan MARC"
                amount={amount(item.amount_cents, item.currency)}
                status={item.status}
                date={item.created_at}
              />
            ))}
          </PaymentGroup>
        </div>
      )}
    </div>
  );
}

function PaymentGroup({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <section className="grid gap-2">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">{title}</h2>
      <Card>
        <CardContent className="grid divide-y divide-border/70 p-0">{children}</CardContent>
      </Card>
    </section>
  );
}

function PaymentRow({
  title,
  amount: value,
  status,
  date,
}: {
  title: string;
  amount: string;
  status: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString("ms-MY")}</p>
      </div>
      <span className="text-sm font-semibold">{value}</span>
      <Badge variant={status === "failed" ? "destructive" : "secondary"}>{statusLabel(status)}</Badge>
    </div>
  );
}
