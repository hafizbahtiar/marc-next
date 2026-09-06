import "server-only";

import { API_INTERNAL_URL } from "@/lib/env";
import { apiFetch } from "@/lib/api/client";

export type LegacyImportBatch = {
  id: string;
  source_filename: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  conflict_rows: number;
  created_at: string;
  rows?: LegacyImportRow[];
};

export type LegacyImportRow = {
  id: string;
  source_row: number;
  status: string;
  legacy_staff_id: string;
  member_id: string;
  display_name: string;
  email: string;
  phone: string;
  department_code: string;
  position: string;
  legacy_status: string;
  conflicts: { code: string; message: string }[];
  warnings: { code: string; message: string }[];
  user_id: string | null;
};

export function listLegacyImportBatches(accessToken: string) {
  return apiFetch<{ batches: LegacyImportBatch[] }>("/admin/legacy-member-import/batches", {
    accessToken,
  });
}

export function getLegacyImportBatch(accessToken: string, id: string) {
  return apiFetch<{ rows: LegacyImportRow[] }>(`/admin/legacy-member-import/${encodeURIComponent(id)}`, {
    accessToken,
  });
}

export async function uploadLegacyImport(accessToken: string, formData: FormData) {
  const response = await fetch(`${API_INTERNAL_URL}/admin/legacy-member-import/dry-run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
    cache: "no-store",
  });
  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : undefined;
  if (!response.ok) {
    throw new Error(
      parsed && typeof parsed.error === "string" ? parsed.error : "Gagal menjalankan dry-run import.",
    );
  }
  return parsed as {
    id: string;
    source_file: string;
    total_rows: number;
    valid_rows: number;
    conflict_rows: number;
    warnings: number;
    header_row: number;
  };
}

export function importLegacyBatch(accessToken: string, id: string) {
  return apiFetch<{ imported: number; unclaimed: string }>(
    `/admin/legacy-member-import/${encodeURIComponent(id)}/import`,
    { method: "POST", accessToken },
  );
}
