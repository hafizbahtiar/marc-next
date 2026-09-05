"use server";

import { revalidatePath } from "next/cache";

import * as membersApi from "@/lib/members/api";
import { accessToken } from "@/lib/auth/session";

type Hasil = { ok: true; mesej: string } | { ok: false; mesej: string };

async function jalankan(
  operation: (token: string) => Promise<void>,
  successMessage: string,
): Promise<Hasil> {
  const token = await accessToken();
  if (!token) return { ok: false, mesej: "Sesi anda sudah tamat." };

  try {
    await operation(token);
    revalidatePath("/members");
    revalidatePath("/members/pending");
    return { ok: true, mesej: successMessage };
  } catch {
    return { ok: false, mesej: "Tindakan gagal. Cuba lagi." };
  }
}

export async function sahkanStaffAction(userId: string) {
  return jalankan(
    (token) => membersApi.sahkanStaff(token, userId),
    "Nombor staff disahkan.",
  );
}

export async function lulusAhliAction(userId: string) {
  return jalankan((token) => membersApi.lulusAhli(token, userId), "Ahli diluluskan.");
}

export async function tolakAhliAction(userId: string) {
  return jalankan((token) => membersApi.tolakAhli(token, userId), "Pendaftaran ditolak.");
}

export async function batalkanBilAction(userId: string) {
  return jalankan(
    (token) => membersApi.batalkanBil(token, userId),
    "Bil pendaftaran dibatalkan.",
  );
}
