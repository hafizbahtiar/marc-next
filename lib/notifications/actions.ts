"use server";

import { accessToken } from "@/lib/auth/session";
import {
  deleteNotification,
  deleteReadNotifications,
  deleteSelectedNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api";

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

export async function deleteNotificationAction(id: string) {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };

  try {
    await deleteNotification(token, id);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Gagal padam notifikasi." };
  }
}

export async function deleteReadNotificationsAction() {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };

  try {
    await deleteReadNotifications(token);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Gagal padam notifikasi yang telah dibaca." };
  }
}

export async function deleteSelectedNotificationsAction(ids: string[]) {
  const token = await accessToken();
  if (!token) return { ok: false as const, message: "Sesi anda sudah tamat." };
  if (ids.length === 0 || ids.length > 100) {
    return { ok: false as const, message: "Pilihan notifikasi tidak sah." };
  }

  try {
    await deleteSelectedNotifications(token, ids);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Gagal padam notifikasi terpilih." };
  }
}
