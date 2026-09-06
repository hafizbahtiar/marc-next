"use server";

import { revalidatePath } from "next/cache";

import { accessToken } from "@/lib/auth/session";
import * as api from "./settings-api";

type Result = { ok: boolean; message: string };

async function withToken(action: (token: string) => Promise<unknown>, message: string): Promise<Result> {
  const token = await accessToken();
  if (!token) return { ok: false, message: "Sesi anda sudah tamat." };
  try {
    await action(token);
    revalidatePath("/settings/activity-categories");
    revalidatePath("/settings/blocked-email-domains");
    revalidatePath("/settings/departments");
    return { ok: true, message };
  } catch {
    return { ok: false, message: "Tindakan gagal. Cuba lagi." };
  }
}

export async function createCategoryAction(key: string, name: string) {
  return withToken((token) => api.createActivityCategory(token, { key, name, sort_order: 0 }), "Kategori dicipta.");
}

export async function toggleCategoryAction(id: string, isActive: boolean, updatedAt: string) {
  return withToken((token) => api.updateActivityCategory(token, id, { is_active: isActive, updated_at: updatedAt }), "Status kategori dikemas kini.");
}

export async function updateCategoryAction(id: string, name: string, sortOrder: number, updatedAt: string) {
  return withToken(
    (token) => api.updateActivityCategory(token, id, { name, sort_order: sortOrder, updated_at: updatedAt }),
    "Kategori dikemas kini.",
  );
}

export async function addBlockedDomainAction(domain: string) {
  return withToken((token) => api.createBlockedDomain(token, domain), "Domain disekat.");
}

export async function removeBlockedDomainAction(domain: string) {
  return withToken((token) => api.deleteBlockedDomain(token, domain), "Sekatan domain dibuang.");
}

export async function createDepartmentAction(code: string, name: string) {
  return withToken((token) => api.createDepartment(token, { code, name }), "Bahagian ditambah.");
}

export async function updateDepartmentAction(code: string, name: string) {
  return withToken((token) => api.updateDepartment(token, code, name), "Bahagian dikemas kini.");
}

export async function deleteDepartmentAction(code: string) {
  return withToken((token) => api.deleteDepartment(token, code), "Bahagian dibuang.");
}
