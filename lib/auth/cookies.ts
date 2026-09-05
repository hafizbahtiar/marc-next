import type { NextResponse } from "next/server";

import { COOKIE_SECURE, REFRESH_TTL_DAYS } from "@/lib/env";
import type { TokenPair } from "@/lib/api/types";

/**
 * Kedua-dua token duduk dalam kuki `httpOnly`. JavaScript pelayar tak
 * boleh membacanya, jadi XSS pada mana-mana halaman tak boleh mengambil
 * sesi - perbezaan sebenar berbanding menyimpan token dalam
 * `localStorage`, yang mana-mana skrip yang disuntik boleh baca.
 */
export const COOKIE_AKSES = "marc_at";
export const COOKIE_REFRESH = "marc_rt";

/**
 * Ditolak daripada `expires_in` supaya kuki access token luput SEBELUM
 * token itu sendiri. Tanpa jurang ini, permintaan yang bermula pada saat
 * terakhir hayat token boleh tiba di backend selepas ia luput, dan ahli
 * nampak 401 rawak dan bukannya refresh yang senyap.
 */
const JURANG_LUPUT_SAAT = 30;

const asasKuki = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  // `lax` (bukan `strict`): pautan pengesahan emel dan pautan reset kata
  // laluan tiba sebagai navigasi rentas tapak daripada klien emel.
  // `strict` akan menahan kuki pada navigasi itu, jadi halaman yang
  // dibuka daripada emel nampak seperti sesi yang tiada.
  sameSite: "lax",
  path: "/",
} as const;

export type StoreKuki = {
  set(name: string, value: string, options: Record<string, unknown>): unknown;
  delete(name: string): unknown;
};

/**
 * Tulis pasangan token ke mana-mana store kuki - `cookies()` daripada
 * `next/headers` dalam tindakan pelayan, atau `response.cookies` dalam
 * `proxy.ts`. Kedua-dua bentuk mendedahkan `set`/`delete` yang serasi,
 * jadi satu fungsi ini melayan kedua-dua laluan dan pilihan kuki tak
 * boleh menyimpang antara keduanya.
 */
export function simpanToken(store: StoreKuki, tokens: TokenPair) {
  store.set(COOKIE_AKSES, tokens.access_token, {
    ...asasKuki,
    maxAge: Math.max(tokens.expires_in - JURANG_LUPUT_SAAT, 1),
  });
  store.set(COOKIE_REFRESH, tokens.refresh_token, {
    ...asasKuki,
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60,
  });
}

export function buangToken(store: StoreKuki) {
  store.delete(COOKIE_AKSES);
  store.delete(COOKIE_REFRESH);
}

/** Untuk `NextResponse` dalam proxy, yang tak menerima objek pilihan `delete`. */
export function buangTokenPadaRespons(response: NextResponse) {
  response.cookies.set(COOKIE_AKSES, "", { ...asasKuki, maxAge: 0 });
  response.cookies.set(COOKIE_REFRESH, "", { ...asasKuki, maxAge: 0 });
}
