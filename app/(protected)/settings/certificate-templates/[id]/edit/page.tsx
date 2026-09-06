import { notFound } from "next/navigation";
import { AwardIcon } from "lucide-react";

import { CertificateTemplateForm } from "@/components/admin/certificate-template-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { getCertificateTemplate } from "@/lib/admin/certificate-templates-api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function EditCertificateTemplatePage({
  params,
}: PageProps<"/settings/certificate-templates/[id]/edit">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();

  let template;
  try {
    template = await getCertificateTemplate(accessToken, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb
        items={[
          { href: "/settings", label: "Tetapan" },
          { href: "/settings/certificate-templates", label: "Template sijil" },
        ]}
        current={template.name}
      />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <AwardIcon className="size-4" />
          Pengurusan sijil
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Edit template sijil</h1>
        <p className="text-sm leading-6 text-muted-foreground">{template.name}</p>
      </header>
      <CertificateTemplateForm template={template} />
    </div>
  );
}
