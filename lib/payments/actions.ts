"use server";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import { checkoutRegistrationPayment, listAdminPaymentLogs, reconcilePayments } from "./api";

export async function checkoutRegistrationPaymentAction(phone?: string) {
  const token = await accessToken();
  if (!token) return { ok: false as const, error: "Sesi anda sudah tamat." };

  try {
    const data = await checkoutRegistrationPayment(token, phone?.trim() || undefined);
    if (!data.redirect_url.startsWith("https://")) {
      return { ok: false as const, error: "Pautan pembayaran tidak sah." };
    }
    return { ok: true as const, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false as const, error: error.message, code: error.code };
    }
    if (error instanceof ApiUnreachableError) {
      return { ok: false as const, error: error.message };
    }
    throw error;
  }
}

export async function loadAdminPaymentLogsAction(options: { module?: string; beforeId?: number } = {}) {
  const token = await accessToken();
  if (!token) return { ok: false as const, error: "Sesi anda sudah tamat." };
  try {
    return { ok: true as const, data: await listAdminPaymentLogs(token, options) };
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiUnreachableError) {
      return { ok: false as const, error: error.message };
    }
    throw error;
  }
}

export async function reconcilePaymentsAction() {
  const token = await accessToken();
  if (!token) return { ok: false as const, error: "Sesi anda sudah tamat." };
  try {
    return { ok: true as const, data: await reconcilePayments(token) };
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiUnreachableError) {
      return { ok: false as const, error: error.message };
    }
    throw error;
  }
}
