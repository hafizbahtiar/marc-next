"use server";

import * as authApi from "@/lib/auth/api";
import { accessToken } from "@/lib/auth/session";

export async function janaPautanTelegramAction(): Promise<
  { deepLink: string; error?: never } | { deepLink?: never; error: string }
> {
  const token = await accessToken();
  if (!token) return { error: "Sesi anda sudah tamat." };

  try {
    const result = await authApi.janaPautanTelegram(token);
    return { deepLink: result.deep_link };
  } catch {
    return { error: "Gagal jana pautan Telegram. Cuba lagi." };
  }
}

export async function nyahikatTelegramAction(): Promise<{ error?: string }> {
  const token = await accessToken();
  if (!token) return { error: "Sesi anda sudah tamat." };

  try {
    await authApi.nyahikatTelegram(token);
    return {};
  } catch {
    return { error: "Gagal nyahikat Telegram. Cuba lagi." };
  }
}

export async function mintaPadamAkaunAction(): Promise<{ berjaya?: string; error?: string }> {
  const token = await accessToken();
  if (!token) return { error: "Sesi anda sudah tamat." };

  try {
    await authApi.mintaPadamAkaun(token);
    return { berjaya: "Permintaan pemadaman akaun direkod. Kami akan hubungi anda." };
  } catch {
    return { error: "Gagal hantar permintaan. Cuba lagi." };
  }
}
