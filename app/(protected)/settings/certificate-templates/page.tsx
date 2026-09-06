import { AwardIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { CertificateTemplateTable } from "@/components/admin/certificate-template-table";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { listCertificateTemplates } from "@/lib/admin/certificate-templates-api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function CertificateTemplatesPage() {
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const { templates } = await listCertificateTemplates(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Template sijil" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <AwardIcon className="size-4" />
          Pengurusan sijil
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Template sijil</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Urus reka bentuk global yang digunakan untuk sijil aktiviti MARC.
        </p>
      </header>

      <CertificateTemplateTable templates={templates} />
    </div>
  );
}
