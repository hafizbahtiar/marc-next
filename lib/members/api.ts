import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { MemberRow } from "@/lib/api/types";

export function listMembers(accessToken: string): Promise<MemberRow[]> {
  return apiFetch<MemberRow[]>("/members", { accessToken });
}

export function listPendingMembers(accessToken: string): Promise<MemberRow[]> {
  return apiFetch<MemberRow[]>("/members?status=pending", { accessToken });
}

export function verifyStaff(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/verify-staff-id`, {
    method: "POST",
    accessToken,
  });
}

export function approveMember(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/approve`, { method: "POST", accessToken });
}

export function rejectMember(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/reject`, { method: "POST", accessToken });
}

export function cancelRegistrationBill(accessToken: string, userId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/cancel-registration-payment`, {
    method: "POST",
    accessToken,
  });
}
