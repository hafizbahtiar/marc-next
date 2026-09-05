"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilter,
} from "@/components/marc/data-table";
import { ResponsiveDetailsSheet } from "@/components/marc/responsive-sheet";
import { StatusBadge, statusTone } from "@/components/marc/status-badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
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
      <StatusBadge label={actionLabel(row.original.action)} tone={statusTone(row.original.action)} />
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
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Masa" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString("ms-MY"),
  },
  {
    id: "details",
    header: "Detail",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <ResponsiveDetailsSheet
        title="Detail audit"
        description={`${entityLabel(row.original.entity_type)} · ${actionLabel(row.original.action)}`}
        trigger={
          <Button type="button" size="sm" variant="outline">
            <EyeIcon />
            Lihat
          </Button>
        }
      >
        <AuditLogDetails log={row.original} />
      </ResponsiveDetailsSheet>
    ),
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

function AuditLogDetails({ log }: { log: AuditLog }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
        <DetailItem label="Entiti" value={entityLabel(log.entity_type)} />
        <DetailItem label="ID entiti" value={log.entity_id} />
        <DetailItem label="Tindakan" value={actionLabel(log.action)} />
        <DetailItem label="Masa" value={new Date(log.created_at).toLocaleString("ms-MY")} />
        <DetailItem label="Pelaku" value={log.actor_member_id ?? "Sistem"} />
        <DetailItem label="Role pelaku" value={log.actor_role_key ?? "-"} />
      </div>

      <DetailSection title="Medan berubah">
        {log.changed_fields.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {log.changed_fields.map((field) => (
              <StatusBadge key={field} label={field} tone="info" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tiada medan khusus direkodkan.</p>
        )}
      </DetailSection>

      {log.old_values ? <DetailSection title="Nilai lama"><JsonValue value={log.old_values} /></DetailSection> : null}
      {log.new_values ? <DetailSection title="Nilai baharu"><JsonValue value={log.new_values} /></DetailSection> : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function JsonValue({ value }: { value: Record<string, unknown> }) {
  return (
    <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs leading-5 whitespace-pre-wrap break-words">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
