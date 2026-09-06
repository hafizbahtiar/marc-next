"use server";

import { ApiError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/client";

export type ClaimActionResult = { ok: true; message: string } | { ok: false; error: string };

function errorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return "Permintaan tidak berjaya. Cuba lagi.";
}

export async function requestClaimAction(
  _previous: ClaimActionResult | undefined,
  formData: FormData,
): Promise<ClaimActionResult> {
  try {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const staffID = String(formData.get("staff_id") ?? "").trim();
    if (!email || !staffID) return { ok: false, error: "Emel dan ID staff diperlukan." };
    await apiFetch<void>("/auth/legacy-member-claim/request", {
      method: "POST",
      body: { email, staff_id: staffID },
    });
    return {
      ok: true,
      message: "Jika maklumat sepadan, pautan tuntutan telah dihantar ke emel tersebut.",
    };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function completeClaimAction(
  _previous: ClaimActionResult | undefined,
  formData: FormData,
): Promise<ClaimActionResult> {
  try {
    const token = String(formData.get("token") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("password_confirmation") ?? "");
    if (!token) return { ok: false, error: "Pautan claim tidak lengkap." };
    if (password.length < 6) return { ok: false, error: "Kata laluan mesti sekurang-kurangnya 6 aksara." };
    if (password !== confirmation) return { ok: false, error: "Kata laluan tidak sepadan." };
    await apiFetch<void>("/auth/legacy-member-claim/complete", {
      method: "POST",
      body: { token, password },
    });
    return { ok: true, message: "Akaun berjaya dituntut. Anda boleh log masuk sekarang." };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
