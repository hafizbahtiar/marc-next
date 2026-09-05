import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { MemberRow } from "@/lib/api/types";

export function senaraiAhli(accessToken: string): Promise<MemberRow[]> {
  return apiFetch<MemberRow[]>("/members", { accessToken });
}

export function senaraiAhliPending(accessToken: string): Promise<MemberRow[]> {
  return apiFetch<MemberRow[]>("/members?status=pending", { accessToken });
}

export function sahkanStaff(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/verify-staff-id`, {
    method: "POST",
    accessToken,
  });
}

export function lulusAhli(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/approve`, { method: "POST", accessToken });
}

export function tolakAhli(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/reject`, { method: "POST", accessToken });
}

export function batalkanBil(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/cancel-registration-payment`, {
    method: "POST",
    accessToken,
  });
}
