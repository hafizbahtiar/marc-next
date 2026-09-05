"use server";

import { accessToken } from "@/lib/auth/session";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "./api";

export async function loadNotificationsAction(cursor?: string) {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };

  try {
    return { ok: true as const, data: await listNotifications(token, cursor) };
  } catch {
    return { ok: false as const, message: "Gagal memuat notifikasi. Cuba lagi." };
  }
}

export async function markNotificationReadAction(id: string) {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };

  try {
    await markNotificationRead(token, id);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Gagal tanda notifikasi dibaca." };
  }
}

export async function markAllNotificationsReadAction() {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };

  try {
    await markAllNotificationsRead(token);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Gagal tanda semua notifikasi dibaca." };
  }
}
