import "server-only";

import { apiFetch } from "@/lib/api/client";

export type PaymentHistory = {
  registration_fee: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    gateway: string;
    status: string;
    created_at: string;
  }>;
  activity_fees: Array<{
    registration_id: string;
    title: string;
    fee_cents: number;
    currency: string;
    payment_status: string;
    starts_at: string;
  }>;
  donations: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  outstanding_registration_fee?: boolean;
};

export function getPaymentHistory(accessToken: string): Promise<PaymentHistory> {
  return apiFetch<PaymentHistory>("/me/payments", { accessToken });
}
