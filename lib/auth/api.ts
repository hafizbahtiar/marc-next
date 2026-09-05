import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Profile, SessionRecord, TokenPair } from "@/lib/api/types";

/**
 * Pembalut nipis atas laluan `/auth` backend Go. Nilai pulangan `void`
 * bermakna backend menjawab 204 tanpa badan - lihat komen 204 dalam
 * lib/api/client.ts.
 */

export function login(
  body: { email: string; password: string },
  deviceLabel: string,
): Promise<TokenPair> {
  return apiFetch<TokenPair>("/auth/login", {
    method: "POST",
    body,
    headers: { "X-MARC-Device-Label": deviceLabel },
  });
}

export function register(
  body: { email: string; password: string; phone: string; staff_id: string },
  deviceLabel: string,
): Promise<TokenPair> {
  return apiFetch<TokenPair>("/auth/register", {
    method: "POST",
    body,
    headers: { "X-MARC-Device-Label": deviceLabel },
  });
}

/**
 * `forwardedFor` diserahkan secara eksplisit kerana satu-satunya
 * pemanggil ialah `proxy.ts`, yang tak boleh menggunakan `next/headers`.
 */
export function refresh(
  refreshToken: string,
  deviceLabel?: string,
  forwardedFor?: string | null,
): Promise<TokenPair> {
  return apiFetch<TokenPair>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    headers: deviceLabel ? { "X-MARC-Device-Label": deviceLabel } : undefined,
    forwardedFor,
  });
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export function logoutAll(accessToken: string): Promise<void> {
  return apiFetch<void>("/auth/logout-all", { method: "POST", accessToken });
}

export function me(accessToken: string): Promise<Profile> {
  return apiFetch<Profile>("/me", { accessToken });
}

export function senaraiSesi(accessToken: string): Promise<SessionRecord[]> {
  return apiFetch<SessionRecord[]>("/me/sessions", { accessToken });
}

export function batalkanSesi(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/me/sessions/${id}`, { method: "DELETE", accessToken });
}

/**
 * Minta emel pengesahan baharu.
 *
 * Laluan ini duduk di bawah `RequireAuth` + `RequireApprovedStatus` di
 * backend (lihat protectedAuthGroup, internal/http/router.go), jadi ahli
 * yang masih `pending` akan dapat 403 - bukan ralat, tetapi keadaan
 * produk sebenar yang UI mesti terangkan dan bukan cuba semula.
 */
export function mintaPengesahanEmel(accessToken: string): Promise<void> {
  return apiFetch<void>("/auth/verify-email/request", { method: "POST", accessToken });
}

export function sahkanEmel(token: string): Promise<void> {
  return apiFetch<void>("/auth/verify-email/confirm", { method: "POST", body: { token } });
}

export function mintaResetKataLaluan(email: string): Promise<void> {
  return apiFetch<void>("/auth/password-reset/request", { method: "POST", body: { email } });
}

export function sahkanResetKataLaluan(token: string, password: string): Promise<void> {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: { token, password },
  });
}
