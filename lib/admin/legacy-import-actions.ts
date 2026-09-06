"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";

import {
  importLegacyBatch,
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
