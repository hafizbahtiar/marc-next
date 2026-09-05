"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilter,
} from "@/components/marc/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/lib/audit/api";

const filters: DataTableFilter[] = [
  {
    columnId: "entity_type",
    title: "Entiti",
    options: [
      { value: "post", label: "Post" },
      { value: "comment", label: "Comment" },
      { value: "profile", label: "Ahli" },
    ],
  },
  {
    columnId: "action",
    title: "Tindakan",
    options: [
      { value: "create", label: "Dicipta" },
      { value: "update", label: "Dikemas kini" },
      { value: "delete", label: "Dipadam" },
    ],
  },
];

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "entity_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Entiti" />,
    cell: ({ row }) => entityLabel(row.original.entity_type),
  },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tindakan" />,
    cell: ({ row }) => (
      <Badge variant={row.original.action === "delete" ? "destructive" : "secondary"}>
        {actionLabel(row.original.action)}
      </Badge>
    ),
  },
  {
    accessorKey: "actor_member_id",
    header: "Pelaku",
    cell: ({ row }) => (
      <div className="min-w-32">
        <p>{row.original.actor_member_id ?? "Sistem"}</p>
        {row.original.actor_role_key ? <p className="text-xs text-muted-foreground">{row.original.actor_role_key}</p> : null}
      </div>
    ),
  },
  {
    accessorKey: "changed_fields",
    header: "Medan berubah",
    enableSorting: false,
    cell: ({ row }) => row.original.changed_fields.join(", ") || "-",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Masa" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString("ms-MY"),
  },
];

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <DataTable
      columns={columns}
      data={logs}
      filters={filters}
      emptyMessage="Tiada catatan."
      getRowId={(log) => `${log.id}`}
      pageSizeOptions={[10, 20, 50]}
      initialPageSize={20}
    />
  );
}

function entityLabel(value: string) {
  return value === "profile" ? "Ahli" : value === "comment" ? "Comment" : value === "post" ? "Post" : value;
}

function actionLabel(value: string) {
  return value === "create" ? "Dicipta" : value === "update" ? "Dikemas kini" : value === "delete" ? "Dipadam" : value;
}
