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

export function correctStaffId(accessToken: string, userId: string, staffId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/staff-id`, {
    method: "PATCH",
    body: { staff_id: staffId },
    accessToken,
  });
}

export function correctMemberId(accessToken: string, userId: string, memberId: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/member-id`, {
    method: "PATCH",
    body: { member_id: memberId },
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

export type MemberRole = {
  key: string;
  name: string;
  rank: number;
};

export type AssignableDepartment = {
  code: string;
  name: string;
};

export function listRoles(accessToken: string): Promise<MemberRole[]> {
  return apiFetch<MemberRole[]>("/roles", { accessToken });
}

export function listAssignableDepartments(accessToken: string): Promise<AssignableDepartment[]> {
  return apiFetch<AssignableDepartment[]>("/departments", { accessToken });
}

export function updateMemberRole(accessToken: string, userId: string, roleKey: string, updatedAt: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/role`, {
    method: "PATCH",
    body: { role_key: roleKey, updated_at: updatedAt },
    accessToken,
  });
}

export function updateMemberActive(accessToken: string, userId: string, isActive: boolean, updatedAt: string): Promise<void> {
  return apiFetch<void>(`/members/${userId}/active`, {
    method: "PATCH",
    body: { is_active: isActive, updated_at: updatedAt },
    accessToken,
  });
}

export function updateMemberDepartment(
  accessToken: string,
  userId: string,
  body: { department_code: string | null; position: string | null; updated_at: string },
): Promise<void> {
  return apiFetch<void>(`/members/${userId}/department`, { method: "PATCH", body, accessToken });
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

export async function getMemberDetail(accessToken: string, userId: string): Promise<MemberDetail> {
  const member = await apiFetch<MemberDetail>(`/members/${encodeURIComponent(userId)}`, { accessToken });
  return { ...member, addresses: member.addresses ?? [] };
}
