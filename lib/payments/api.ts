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

export type RegistrationCheckoutResponse = {
  redirect_url: string;
};

export function checkoutRegistrationPayment(
  accessToken: string,
  phone?: string,
): Promise<RegistrationCheckoutResponse> {
  return apiFetch<RegistrationCheckoutResponse>("/registration-payments/checkout", {
    method: "POST",
    body: phone ? { phone } : undefined,
    accessToken,
  });
}

export type PaymentLog = {
  id: number;
  module: "registration_fee" | "activity_fee" | "donation" | string;
  event: string;
  status: string;
  gateway: string;
  gateway_ref: string | null;
  amount_cents: number | null;
  user_id: string | null;
  related_id: string | null;
  message: string | null;
  created_at: string;
};

export type AdminPaymentLogsResponse = {
  logs: PaymentLog[];
};

export type ReconcileSummary = {
  checked: number;
  mismatches_fixed: number;
  errors: number;
};

export function listAdminPaymentLogs(
  accessToken: string,
  options: { module?: string; beforeId?: number; limit?: number } = {},
): Promise<AdminPaymentLogsResponse> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 50) });
  if (options.module) params.set("module", options.module);
  if (options.beforeId) params.set("before_id", String(options.beforeId));
  return apiFetch<AdminPaymentLogsResponse>(`/admin/payments?${params.toString()}`, { accessToken });
}

export function reconcilePayments(accessToken: string): Promise<ReconcileSummary> {
  return apiFetch<ReconcileSummary>("/admin/payments/reconcile", { method: "POST", accessToken });
}
