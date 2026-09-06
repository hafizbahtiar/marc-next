"use client";

import Link from "next/link";
import { CheckCircle2Icon, PencilIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CertificateTemplate } from "@/lib/admin/certificate-templates-api";

const templateColumns: ColumnDef<CertificateTemplate>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Template" />,
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
      <div
        className="flex items-center gap-1.5"
        aria-label={`Warna ${row.original.primary_color} dan ${row.original.secondary_color}`}
      >
        <span className="size-6 rounded-full border" style={{ backgroundColor: row.original.primary_color }} />
        <span className="size-6 rounded-full border" style={{ backgroundColor: row.original.secondary_color }} />
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge>
          <CheckCircle2Icon /> Aktif
        </Badge>
      ) : (
        <Badge variant="secondary">Draf</Badge>
      ),
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dikemas kini" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.updated_at)}
      </span>
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

export function CertificateTemplateTable({ templates }: { templates: CertificateTemplate[] }) {
  return (
    <DataTable
      columns={templateColumns}
      data={templates}
      emptyMessage="Tiada template sijil ditemui."
      enablePagination={false}
      className="min-w-0"
    />
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}
