"use server";

import { ApiError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";

import { createDonationCheckout, type DonationCheckoutInput } from "./api";

export type DonationActionResult =
  | { ok: true; data: { clientSecret: string } }
  | { ok: false; error: string };

export async function createDonationCheckoutAction(
  input: DonationCheckoutInput,
): Promise<DonationActionResult> {
  try {
    const token = await accessToken();
    const data = await createDonationCheckout({
      amount_cents: input.amount_cents,
      donor_name: input.donor_name?.trim() || undefined,
      donor_email: input.donor_email.trim().toLowerCase(),
    }, token ?? undefined);

    if (!data.client_secret) {
      return { ok: false, error: "Pembayaran kad belum tersedia buat masa ini." };
    }

    return { ok: true, data: { clientSecret: data.client_secret } };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Gagal memulakan pembayaran. Cuba lagi." };
  }
}
