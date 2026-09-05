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

export type MemberDetail = MemberRow & {
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  health_notes: string | null;
  telegram_linked: boolean | null;
  telegram_username: string | null;
  addresses: Array<{
    id: string;
    label: string | null;
    city: string;
    state: string;
    postcode: string;
    street: string | null;
  }> | null;
};

export function getMemberDetail(accessToken: string, userId: string): Promise<MemberDetail> {
  return apiFetch<MemberDetail>(`/members/${encodeURIComponent(userId)}`, { accessToken });
}
