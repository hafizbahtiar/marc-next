import Link from "next/link";
import { AwardIcon, CheckCircle2Icon, PencilIcon } from "lucide-react";
import { notFound } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CertificateTemplate } from "@/lib/admin/certificate-templates-api";
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

      <DataTable
        columns={templateColumns}
        data={templates}
        emptyMessage="Tiada template sijil ditemui."
        enablePagination={false}
        className="min-w-0"
      />
    </div>
  );
}

const templateColumns: ColumnDef<CertificateTemplate>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Template" />
    ),
    cell: ({ row }) => (
      <div className="grid min-w-48 gap-1">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.title}</span>
      </div>
    ),
  },
  {
    id: "colors",
    header: "Warna",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5" aria-label={`Warna ${row.original.primary_color} dan ${row.original.secondary_color}`}>
        <span className="size-6 rounded-full border" style={{ backgroundColor: row.original.primary_color }} />
        <span className="size-6 rounded-full border" style={{ backgroundColor: row.original.secondary_color }} />
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => row.original.is_active
      ? <Badge><CheckCircle2Icon /> Aktif</Badge>
      : <Badge variant="secondary">Draf</Badge>,
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dikemas kini" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.updated_at)}</span>
    ),
  },
  {
    id: "actions",
    header: "Tindakan",
    enableSorting: false,
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/settings/certificate-templates/${encodeURIComponent(row.original.id)}/edit`}>
          <PencilIcon />
          Edit
        </Link>
      </Button>
    ),
  },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeZone: "Asia/Kuala_Lumpur" }).format(date);
}
