import "server-only";

import { apiFetch } from "@/lib/api/client";

export type DonationCheckoutInput = {
  amount_cents: number;
  donor_name?: string;
  donor_email: string;
};

export type DonationCheckoutResponse = {
  gateway: string;
  client_secret: string;
  redirect_url: string;
};

export function createDonationCheckout(
  body: DonationCheckoutInput,
  token?: string,
): Promise<DonationCheckoutResponse> {
  return apiFetch<DonationCheckoutResponse>("/donations/checkout", {
    method: "POST",
    body,
    accessToken: token,
  });
}
