"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";

import {
  importLegacyBatch,
  resolveLegacyImportDepartment,
  updateLegacyImportRow,
  uploadLegacyImport,
} from "./legacy-import-api";

export type LegacyImportActionResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

async function token() {
  const value = await accessToken();
  if (!value) throw new Error("Sesi anda sudah tamat.");
  return value;
}

function message(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return "Tindakan import tidak berjaya.";
}

export async function dryRunLegacyImportAction(formData: FormData): Promise<LegacyImportActionResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Pilih fail CSV terlebih dahulu." };
    }
    return { ok: true, data: await uploadLegacyImport(await token(), formData) };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function importLegacyBatchAction(id: string): Promise<LegacyImportActionResult> {
  try {
    return { ok: true, data: await importLegacyBatch(await token(), id) };
  } catch (error) {
    return { ok: false, error: message(error) };
  } finally {
    revalidatePath("/settings/legacy-import");
  }
}

export async function updateLegacyImportRowAction(
  rowId: string,
  staffId: string,
): Promise<LegacyImportActionResult> {
  try {
    const trimmed = staffId.trim();
    if (!trimmed) return { ok: false, error: "No. ID. tidak boleh kosong." };
    return { ok: true, data: await updateLegacyImportRow(await token(), rowId, { legacy_staff_id: trimmed }) };
  } catch (error) {
    return { ok: false, error: message(error) };
  } finally {
    revalidatePath("/settings/legacy-import");
  }
}

/**
 * `name` ditinggalkan bila superadmin memilih bahagian sedia ada -
 * backend menganggapnya merge dan tak menyentuh nama bahagian itu.
 */
export async function resolveLegacyImportDepartmentAction(
  batchId: string,
  from: string,
  code: string,
  name?: string,
): Promise<LegacyImportActionResult> {
  try {
    const kod = code.trim();
    const nama = name?.trim();
    if (!kod) return { ok: false, error: "Kod bahagian diperlukan." };
    if (kod.includes("/")) {
      return { ok: false, error: "Kod bahagian tidak boleh mengandungi '/'." };
    }
    return {
      ok: true,
      data: await resolveLegacyImportDepartment(await token(), batchId, {
        from,
        code: kod,
        ...(nama ? { name: nama } : {}),
      }),
    };
  } catch (error) {
    return { ok: false, error: message(error) };
  } finally {
    revalidatePath("/settings/legacy-import");
  }
}
