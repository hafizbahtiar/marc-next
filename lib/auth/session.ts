import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import type { Profile } from "@/lib/api/types";
import * as authApi from "./api";
import { COOKIE_AKSES, COOKIE_REFRESH } from "./cookies";
import { ROUTES } from "./routes";

export type Sesi = {
  accessToken: string;
  profile: Profile;
};

/**
 * Baca access token daripada kuki.
 *
 * TIADA refresh berlaku di sini. Komponen dan susun atur pelayan tak
 * boleh menulis kuki dalam Next, jadi refresh yang dicuba dari sini akan
 * mendapat token baharu yang tak dapat disimpan - dan memulakan pusingan
 * yang sama pada permintaan seterusnya, membakar satu token setiap kali
 * sehingga pengesanan guna-semula backend membatalkan seluruh family.
 * Refresh berlaku dalam `proxy.ts` sahaja, yang memang boleh menulis
 * kuki pada respons.
 */
export async function accessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_AKSES)?.value ?? null;
}

export async function refreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_REFRESH)?.value ?? null;
}

/**
 * Profil ahli semasa, atau null bila tiada sesi sah.
 *
 * Dibalut `cache()` React supaya susun atur, halaman dan komponen dalam
 * SATU render berkongsi satu panggilan GET /me - bukan cache merentas
 * permintaan, jadi tiada data ahli yang bocor antara pelawat.
 */
export const dapatkanSesi = cache(async (): Promise<Sesi | null> => {
  const token = await accessToken();
  if (!token) return null;

  try {
    return { accessToken: token, profile: await authApi.me(token) };
  } catch (error) {
    // 401 di sini bermakna kuki wujud tetapi backend menolaknya (rahsia
    // JWT diputar, atau akaun dipadam). Melaporkannya sebagai "tiada
    // sesi" membiarkan pemanggil mengubah hala ke log masuk; kuki basi
    // itu dibersihkan oleh /api/sesi/tamat, kerana komponen pelayan tak
    // boleh memadamnya sendiri.
    if (error instanceof ApiError && error.isUnauthorized) return null;

    // Backend tak dapat dihubungi walaupun access token masih ada.
    // Melaporkannya sebagai "tiada sesi" akan menghantar ahli ke
    // /api/sesi/tamat dan membuang kuki yang sah - gangguan rangkaian
    // sekejap tak patut menjadi log keluar. Padanan pengendalian yang
    // sama dalam proxy.ts.
    if (error instanceof ApiUnreachableError) redirect(ROUTES.pelayanLuarTalian);

    throw error;
  }
});

/**
 * Sesi wajib. Mengubah hala ke log masuk (mengekalkan destinasi asal)
 * bila tiada.
 */
export async function wajibSesi(destinasiAsal?: string): Promise<Sesi> {
  const sesi = await dapatkanSesi();
  if (sesi) return sesi;

  const next = destinasiAsal ? `?next=${encodeURIComponent(destinasiAsal)}` : "";
  redirect(`${ROUTES.tamatSesi}${next}`);
}

/**
 * Skrin gate yang sepatutnya dilihat ahli ini, atau null kalau dia
 * mempunyai akses penuh.
 *
 * Urutan padanan lapisan middleware backend: `RequireApprovedStatus`
 * berjalan SEBELUM `RequireVerifiedEmail` (internal/http/router.go), jadi
 * ahli pending yang emelnya belum disahkan mesti nampak skrin kelulusan
 * dahulu - memaparkan skrin "sahkan emel" kepadanya akan menjanjikan
 * akses yang kelulusan masih tahan, dan butang hantar semula pada skrin
 * itu memang akan gagal dengan 403 untuknya (lihat
 * mintaPengesahanEmel, lib/auth/api.ts).
 */
export function skrinGate(profile: Profile): string | null {
  if (profile.status === "rejected") return ROUTES.akaunDitolak;
  if (profile.status === "pending") return ROUTES.menungguKelulusan;
  if (!profile.email_verified) return ROUTES.sahkanEmelAnda;
  return null;
}
