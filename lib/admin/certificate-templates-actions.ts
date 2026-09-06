"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import {
  publishCertificateTemplate,
  updateCertificateTemplate,
} from "./certificate-templates-api";
import type { CertificateTemplate, CertificateTemplateInput } from "./certificate-templates-api";

export type CertificateTemplateActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function getToken() {
  const token = await accessToken();
  if (!token) throw new Error("Sesi anda sudah tamat.");
  return token;
}

function actionError(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Tindakan tidak berjaya. Cuba lagi.";
}

export async function updateCertificateTemplateAction(
  id: string,
  input: CertificateTemplateInput,
): Promise<CertificateTemplateActionResult<CertificateTemplate>> {
  try {
    const data = await updateCertificateTemplate(await getToken(), id, input);
    revalidatePath("/settings/certificate-templates");
    revalidatePath(`/settings/certificate-templates/${id}/edit`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function publishCertificateTemplateAction(
  id: string,
): Promise<CertificateTemplateActionResult<CertificateTemplate>> {
  try {
    const data = await publishCertificateTemplate(await getToken(), id);
    revalidatePath("/settings/certificate-templates");
    revalidatePath(`/settings/certificate-templates/${id}/edit`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
