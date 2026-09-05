"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarDaysIcon, CreditCardIcon, MapPinIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CheckinQr } from "@/components/activities/checkin-qr";
import { Input } from "@/components/ui/input";
import type { MyRegistration } from "@/lib/activities/api";
import { checkoutActivityAction } from "@/lib/activities/actions";
import { formatActivityDateTime, formatCurrency, groupRegistrations } from "@/lib/activities/helpers";

export function MyActivityList({ registrations }: { registrations: MyRegistration[] }) {
  const groups = groupRegistrations(registrations);

  return (
    <div className="grid gap-8">
      <RegistrationGroup title="Akan datang" items={groups.upcoming} />
      <RegistrationGroup title="Aktiviti lepas" items={groups.past} />
    </div>
  );
}

function RegistrationGroup({ title, items }: { title: string; items: MyRegistration[] }) {
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          Tiada aktiviti dalam senarai ini.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((registration) => (
            <RegistrationCard key={registration.id} registration={registration} />
          ))}
        </div>
      )}
    </section>
  );
}

function RegistrationCard({ registration }: { registration: MyRegistration }) {
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);

  function checkout() {
    startTransition(async () => {
      const result = await checkoutActivityAction(registration.activity_id, phone || undefined);
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

  const isCancelled = registration.activity_status === "cancelled";
  return (
    <article className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <Link
            href={`/activities/${encodeURIComponent(registration.activity_id)}`}
            className="font-heading text-lg font-semibold leading-tight hover:text-primary"
          >
            {registration.title}
          </Link>
          <p className="text-sm text-muted-foreground">{registration.category_name}</p>
        </div>
        <span className={isCancelled ? "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive" : "rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"}>
          {isCancelled ? "Dibatalkan" : registration.payment_status === "paid" ? "Dibayar" : "Berdaftar"}
        </span>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><CalendarDaysIcon className="size-4 text-primary" />{formatActivityDateTime(registration.starts_at)}</p>
        <p className="flex items-center gap-2"><MapPinIcon className="size-4 text-primary" />Aktiviti MARC</p>
      </div>
      {registration.payment_status === "pending" && !isCancelled ? (
        <div className="grid gap-2 border-t pt-3">
          <p className="text-sm font-medium">
            Bayaran diperlukan{registration.fee_cents !== null ? ` · ${formatCurrency(registration.fee_cents, registration.currency)}` : ""}
          </p>
          {needsPhone ? (
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Nombor telefon untuk bayaran" inputMode="tel" />
          ) : null}
          <Button type="button" size="sm" onClick={checkout} disabled={pending || (needsPhone && !phone.trim())}>
            <CreditCardIcon />
            {pending ? "Menyediakan bayaran…" : "Bayar yuran aktiviti"}
          </Button>
        </div>
      ) : null}
      {!isCancelled && registration.checkin_token && new Date(registration.ends_at) > new Date() ? (
        <CheckinQr token={registration.checkin_token} />
      ) : null}
    </article>
  );
}
