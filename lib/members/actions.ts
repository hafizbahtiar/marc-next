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
