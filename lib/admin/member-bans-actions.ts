"use server";

import { revalidatePath } from "next/cache";

import { accessToken } from "@/lib/auth/session";
import * as api from "./member-bans-api";

export async function unbanMemberAction(userId: string) {
  const token = await accessToken();
  if (!token) return { ok: false, message: "Sesi anda sudah tamat." };
  try {
    await api.unbanMember(token, userId);
    revalidatePath("/settings/banned-members");
    revalidatePath("/members");
    return { ok: true, message: "Penggantungan akaun telah dibuka." };
  } catch {
    return { ok: false, message: "Gagal membuka penggantungan akaun." };
  }
}

export async function banMemberAction(
  userId: string,
  reason: string,
  expiresAt?: string,
) {
  const token = await accessToken();
  if (!token) return { ok: false, message: "Sesi anda sudah tamat." };
  try {
    await api.banMember(token, userId, { reason, expires_at: expiresAt });
    revalidatePath("/settings/banned-members");
    revalidatePath("/members");
    return { ok: true, message: "Akaun telah digantung." };
  } catch {
    return { ok: false, message: "Gagal menggantung akaun." };
  }
}
