import "server-only";

import { apiFetch } from "@/lib/api/client";

export type CertificateTemplate = {
  id: string;
  name: string;
  is_active: boolean;
  updated_at: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  title: string;
  subtitle: string;
  body_text: string;
  issuer_name: string;
  signature_name: string;
  footer_text: string;
};

export type CertificateTemplateInput = Omit<CertificateTemplate, "id" | "is_active">;

export function listCertificateTemplates(token: string) {
  return apiFetch<{ templates: CertificateTemplate[] }>("/admin/certificate-templates", {
    accessToken: token,
  });
}

export function getCertificateTemplate(token: string, id: string) {
  return apiFetch<CertificateTemplate>(`/admin/certificate-templates/${encodeURIComponent(id)}`, {
    accessToken: token,
  });
}

export function updateCertificateTemplate(token: string, id: string, body: CertificateTemplateInput) {
  return apiFetch<CertificateTemplate>(`/admin/certificate-templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
    accessToken: token,
  });
}

export function publishCertificateTemplate(token: string, id: string, updatedAt: string) {
  return apiFetch<CertificateTemplate>(`/admin/certificate-templates/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    body: { updated_at: updatedAt },
    accessToken: token,
  });
}
