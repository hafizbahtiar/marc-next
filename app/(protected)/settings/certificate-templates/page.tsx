import Link from "next/link";
import { AwardIcon, CheckCircle2Icon, PencilIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">Tiada template sijil</p>
          <p className="mt-1 text-sm text-muted-foreground">Template akan dipaparkan selepas disediakan oleh sistem.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className={template.is_active ? "border-primary/50" : undefined}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="grid gap-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Dikemas kini {formatDate(template.updated_at)}
                  </p>
                </div>
                {template.is_active ? (
                  <Badge><CheckCircle2Icon /> Aktif</Badge>
                ) : (
                  <Badge variant="secondary">Draf</Badge>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="h-16 w-28 rounded-md border" style={{ backgroundColor: template.primary_color }} />
                <Button asChild variant="outline">
                  <Link href={`/settings/certificate-templates/${encodeURIComponent(template.id)}/edit`}>
                    <PencilIcon />
                    Edit template
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeZone: "Asia/Kuala_Lumpur" }).format(date);
}
