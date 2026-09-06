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

/**
 * Backend Go pernah memulangkan `null` untuk slice kosong: lajur
 * conflicts/warnings ialah `jsonb not null default '[]'`, tetapi DEFAULT
 * tak terpakai bila nilai dibekalkan, dan `json.Marshal` pada slice NIL
 * menghasilkan `null` - yang bukan NULL SQL, jadi NOT NULL pun tak
 * menangkapnya.
 *
 * Puncanya sudah dibetulkan di backend (marshalJSONArray +
 * normalizeJSONArray dalam legacy_member_import.go), tetapi normalisasi
 * dikekalkan di SINI - satu sempadan API, bukan optional chaining
 * bertaburan - atas dua sebab: staging/produksi masih menyajikan binari
 * lama sehingga di-deploy semula, dan jenis di bawah MENJANJIKAN array
 * bukan-null kepada setiap pemanggil. Tanpa ini janji itu palsu, dan
 * `row.conflicts.length` dalam legacy-import-console.tsx meletupkan
 * render SSR seluruh halaman.
 *
 * `WireLegacyImportRow` merakam bentuk SEBENAR di atas wayar,
 * berasingan daripada `LegacyImportRow` yang dieksport - jenis eksport
 * itu janji kepada pemanggil, jenis wire ini realiti - supaya
 * normalisasi di bawah disemak jenis dan bukan sekadar `??` yang lint
 * anggap berlebihan.
 */
type WireLegacyImportRow = Omit<LegacyImportRow, "conflicts" | "warnings"> & {
  conflicts: LegacyImportRow["conflicts"] | null;
  warnings: LegacyImportRow["warnings"] | null;
};

export async function listLegacyImportBatches(
  accessToken: string,
): Promise<{ batches: LegacyImportBatch[] }> {
  const response = await apiFetch<{ batches: LegacyImportBatch[] | null }>(
    "/admin/legacy-member-import/batches",
    { accessToken },
  );
  return { batches: response?.batches ?? [] };
}

export async function getLegacyImportBatch(
  accessToken: string,
  id: string,
): Promise<{ rows: LegacyImportRow[] }> {
  const response = await apiFetch<{ rows: WireLegacyImportRow[] | null }>(
    `/admin/legacy-member-import/${encodeURIComponent(id)}`,
    { accessToken },
  );
  return {
    rows: (response?.rows ?? []).map((row) => ({
      ...row,
      conflicts: row.conflicts ?? [],
      warnings: row.warnings ?? [],
    })),
  };
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

/**
 * Membetulkan No. ID. pada satu baris staging. Backend mengira semula
 * SELURUH batch selepas ini, jadi pemanggil mesti muat semula batch -
 * membetulkan satu baris pendua turut membersihkan pasangannya.
 */
export function updateLegacyImportRow(
  accessToken: string,
  rowId: string,
  body: { legacy_staff_id: string },
) {
  return apiFetch<{ batch_id: string }>(
    `/admin/legacy-member-import/rows/${encodeURIComponent(rowId)}`,
    { method: "PATCH", body, accessToken },
  );
}

/**
 * Mencipta bahagian yang hilang DAN menulis semula baris batch yang
 * merujuk nilai CSV asal (`from`) kepada `code`.
 *
 * Dua langkah ini satu operasi kerana kod bahagian tak boleh
 * mengandungi '/'. Nilai seperti "PEJ. TKPE (P) / BKP" mesti ditukar
 * kepada kod bersih, dan baris CSV kena ikut sekali - kalau tidak baris
 * itu kekal merujuk teks lama dan konfliknya tak selesai.
 */
export function resolveLegacyImportDepartment(
  accessToken: string,
  batchId: string,
  body: { from: string; code: string; name: string },
) {
  return apiFetch<{ code: string; name: string }>(
    `/admin/legacy-member-import/${encodeURIComponent(batchId)}/resolve-department`,
    { method: "POST", body, accessToken },
  );
}
