"use server";

import { revalidatePath } from "next/cache";

import { accessToken } from "@/lib/auth/session";
import * as api from "./account-deletion-api";

export async function executeAccountDeletionAction(userId: string) {
  const token = await accessToken();
  if (!token) return { ok: false, message: "Sesi anda sudah tamat." };

  try {
    await api.executeAccountDeletion(token, userId);
    revalidatePath("/settings/account-deletions");
    revalidatePath("/members");
    return { ok: true, message: "Akaun dan data berkaitan telah dipadam." };
  } catch {
    return { ok: false, message: "Pemadaman gagal. Semak status akaun dan cuba lagi." };
  }
}

export async function executeDirectAccountDeletionAction(userId: string, reason: string) {
  const token = await accessToken();
  if (!token) return { ok: false, message: "Sesi anda sudah tamat." };

  try {
    await api.executeDirectAccountDeletion(token, userId, reason);
    revalidatePath("/settings/account-deletions");
    revalidatePath("/members");
    return { ok: true, message: "Akaun dan data berkaitan telah dipadam." };
  } catch {
    return { ok: false, message: "Pemadaman gagal. Semak sebab dan status akaun." };
  }
}
