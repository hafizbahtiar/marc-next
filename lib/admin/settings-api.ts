import "server-only";

import { apiFetch } from "@/lib/api/client";

export type ActivityCategory = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type BlockedDomain = {
  domain: string;
  created_at: string;
};

export type Department = {
  code: string;
  name: string;
  sort_order: number;
};

export function listActivityCategories(token: string) {
  return apiFetch<{ categories: ActivityCategory[] }>("/activity-categories?all=true", { accessToken: token });
}

export function createActivityCategory(token: string, body: { key: string; name: string; sort_order: number }) {
  return apiFetch<ActivityCategory>("/activity-categories", { method: "POST", body, accessToken: token });
}

export function updateActivityCategory(token: string, id: string, body: Partial<Pick<ActivityCategory, "name" | "sort_order" | "is_active">>) {
  return apiFetch<ActivityCategory>(`/activity-categories/${id}`, { method: "PATCH", body, accessToken: token });
}

export function listBlockedDomains(token: string) {
  return apiFetch<{ domains: BlockedDomain[] }>("/admin/blocked-email-domains", { accessToken: token });
}

export function createBlockedDomain(token: string, domain: string) {
  return apiFetch<void>("/admin/blocked-email-domains", { method: "POST", body: { domain }, accessToken: token });
}

export function deleteBlockedDomain(token: string, domain: string) {
  return apiFetch<void>(`/admin/blocked-email-domains/${encodeURIComponent(domain)}`, { method: "DELETE", accessToken: token });
}

export function listDepartments(token: string) {
  return apiFetch<{ departments: Department[] }>("/admin/departments", { accessToken: token });
}

export function createDepartment(token: string, body: { code: string; name: string; sort_order?: number }) {
  return apiFetch<Department>("/admin/departments", { method: "POST", body, accessToken: token });
}

export function updateDepartment(token: string, code: string, name: string) {
  return apiFetch<Department>(`/admin/departments/${encodeURIComponent(code)}`, { method: "PATCH", body: { name }, accessToken: token });
}

export function deleteDepartment(token: string, code: string) {
  return apiFetch<void>(`/admin/departments/${encodeURIComponent(code)}`, { method: "DELETE", accessToken: token });
}
