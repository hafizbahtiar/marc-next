"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Badge } from "@/components/ui/badge";
import { RevokeSessionButton } from "@/components/auth/revoke-session-button";
import type { SessionRecord } from "@/lib/api/types";

const columns: ColumnDef<SessionRecord>[] = [
  {
    accessorKey: "user_agent",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Peranti" />,
    cell: ({ row }) => (
      <div className="min-w-48">
        <p className="truncate font-medium">{row.original.user_agent ?? "Peranti tidak dikenali"}</p>
        {row.original.created_ip ? <p className="text-xs text-muted-foreground">{row.original.created_ip}</p> : null}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Log masuk" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    accessorKey: "is_current",
    header: "Status",
    cell: ({ row }) => row.original.is_current ? <Badge variant="secondary" className="text-primary">Peranti ini</Badge> : "Aktif",
  },
  {
    id: "actions",
    header: "Tindakan",
    enableHiding: false,
    cell: ({ row }) => row.original.is_current ? null : <RevokeSessionButton id={row.original.id} />,
  },
];

export function SessionTable({ sessions }: { sessions: SessionRecord[] }) {
  return (
    <DataTable
      columns={columns}
      data={sessions}
      searchKey="user_agent"
      searchPlaceholder="Cari peranti…"
      emptyMessage="Tiada sesi aktif."
      getRowId={(session) => session.id}
      pageSizeOptions={[5, 10, 20]}
      initialPageSize={10}
    />
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}
