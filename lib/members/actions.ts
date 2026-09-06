"use server";

import { revalidatePath } from "next/cache";

import * as membersApi from "@/lib/members/api";
import { accessToken } from "@/lib/auth/session";

type Hasil = { ok: true; mesej: string } | { ok: false; mesej: string };

async function runMemberAction(
  operation: (token: string) => Promise<void>,
  successMessage: string,
): Promise<Hasil> {
  const token = await accessToken();
  if (!token) return { ok: false, mesej: "Sesi anda sudah tamat." };

  try {
    await operation(token);
    revalidatePath("/members");
    revalidatePath("/members/pending");
    return { ok: true, mesej: successMessage };
  } catch {
    return { ok: false, mesej: "Tindakan gagal. Cuba lagi." };
  }
}

export async function verifyStaffAction(userId: string) {
  return runMemberAction(
    (token) => membersApi.verifyStaff(token, userId),
    "Nombor staff disahkan.",
  );
}

export async function correctStaffIdAction(userId: string, staffId: string) {
  return runMemberAction(
    (token) => membersApi.correctStaffId(token, userId, staffId.trim()),
    "Nombor staff dibetulkan.",
  );
}

export async function correctMemberIdAction(userId: string, memberId: string) {
  return runMemberAction(
    (token) => membersApi.correctMemberId(token, userId, memberId.trim()),
    "Nombor ahli dibetulkan.",
  );
}

export async function approveMemberAction(userId: string) {
  return runMemberAction((token) => membersApi.approveMember(token, userId), "Ahli diluluskan.");
}

export async function rejectMemberAction(userId: string) {
  return runMemberAction((token) => membersApi.rejectMember(token, userId), "Pendaftaran ditolak.");
}

export async function cancelRegistrationBillAction(userId: string) {
  return runMemberAction(
    (token) => membersApi.cancelRegistrationBill(token, userId),
    "Bil pendaftaran dibatalkan.",
  );
}

export async function updateMemberRoleAction(userId: string, roleKey: string, updatedAt: string) {
  return runMemberAction(
    (token) => membersApi.updateMemberRole(token, userId, roleKey, updatedAt),
    "Role ahli dikemas kini.",
  );
}

export async function updateMemberActiveAction(userId: string, isActive: boolean, updatedAt: string) {
  return runMemberAction(
    (token) => membersApi.updateMemberActive(token, userId, isActive, updatedAt),
    isActive ? "Ahli diaktifkan." : "Ahli dinyahaktifkan.",
  );
}

export async function updateMemberDepartmentAction(
  userId: string,
  departmentCode: string | null,
  position: string | null,
  updatedAt: string,
) {
  return runMemberAction(
    (token) => membersApi.updateMemberDepartment(token, userId, { department_code: departmentCode, position, updated_at: updatedAt }),
    "Bahagian dan jawatan ahli dikemas kini.",
  );
}
