"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import type { KeadaanBorang } from "@/lib/auth/borang";
import { ROUTES } from "@/lib/auth/routes";
import { kemaskiniProfil } from "./api";
import { skemaKemaskiniProfil } from "./schemas";

function ralatMedan(error: ZodError): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const isu of error.issues) {
    const kunci = String(isu.path[0] ?? "_");
    if (!(kunci in hasil)) hasil[kunci] = isu.message;
  }
  return hasil;
}

function keadaanRalat(error: unknown, nilai?: Record<string, string>): KeadaanBorang {
  if (error instanceof ApiError || error instanceof ApiUnreachableError) {
    return { ralat: error.message, nilai };
  }
  throw error;
}

export async function kemaskiniProfilAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = {
    display_name: String(formData.get("display_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    emergency_contact_name: String(formData.get("emergency_contact_name") ?? ""),
    emergency_contact_phone: String(formData.get("emergency_contact_phone") ?? ""),
    health_notes: String(formData.get("health_notes") ?? ""),
  };
  const nilai = mentah;

  const disahkan = skemaKemaskiniProfil.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error), nilai };
  }

  // Hadir hanya bila ahli berinteraksi dengan pemilih avatar dalam sesi
  // edit ini (lihat BorangEditProfil, Task 8) — string kosong bermaksud
  // "buang avatar", ketiadaan medan ni langsung bermaksud "jangan sentuh".
  const avatarR2Key = formData.has("avatar_r2_key")
    ? String(formData.get("avatar_r2_key"))
    : undefined;

  const token = await accessToken();
  if (!token) {
    return { ralat: "Sesi tamat. Sila log masuk semula.", nilai };
  }

  try {
    await kemaskiniProfil(token, { ...disahkan.data, avatar_r2_key: avatarR2Key });
  } catch (error) {
    return keadaanRalat(error, nilai);
  }

  revalidatePath(ROUTES.profil);
  redirect(ROUTES.profil);
}
