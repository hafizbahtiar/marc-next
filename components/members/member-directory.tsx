"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/marc/status-badge";
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilter,
} from "@/components/marc/data-table";
import type { MemberRow } from "@/lib/api/types";

export function MemberDirectory({ members }: { members: MemberRow[] }) {
  const departments = useMemo<[string, string][]>(
    () =>
      [...new Map<string, string>(
        members
          .filter((member) => member.department_code)
          .map((member) => [
            member.department_code as string,
            member.department_name ?? member.department_code as string,
          ]),
      )].sort((a, b) => a[1].localeCompare(b[1])),
    [members],
  );

  const filters: DataTableFilter[] = departments.length
    ? [{
        columnId: "department_code",
        title: "Bahagian",
        options: departments.map(([value, label]) => ({ value, label })),
      }]
    : [];

  return (
    <div className="grid gap-4">
      <DataTable
        columns={memberColumns}
        data={members}
        searchKey="display_name"
        searchPlaceholder="Cari nama ahli…"
        filters={filters}
        emptyMessage={members.length === 0 ? "Tiada ahli." : "Tiada ahli sepadan."}
        getRowId={(member) => member.user_id}
      />
    </div>
  );
}

const memberColumns: ColumnDef<MemberRow>[] = [
  {
    accessorKey: "display_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => {
      const member = row.original;
      const name = member.display_name?.trim() || "(Tiada nama)";
      return (
        <div className="flex min-w-44 items-center gap-3">
          <Avatar className="size-9">
            {member.avatar_url ? <AvatarImage src={member.avatar_url} alt="" /> : null}
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            {member.email ? <p className="truncate text-xs text-muted-foreground">{member.email}</p> : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "member_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. ahli" />,
    cell: ({ row }) => row.original.member_id ?? "Belum disahkan",
  },
  {
    accessorKey: "department_code",
    header: "Bahagian",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => row.original.department_name ?? row.original.department_code ?? "-",
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: ({ row }) => row.original.category === "management" ? <StatusBadge label={row.original.role_name} tone="info" /> : <StatusBadge label="Ahli" />,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => row.original.is_active ? <StatusBadge label="Aktif" tone="success" /> : <StatusBadge label="Tidak aktif" tone="danger" />,
  },
  {
    id: "actions",
    header: "Tindakan",
    enableHiding: false,
    cell: ({ row }) => <ButtonLink href={`/members/${row.original.user_id}`}>Lihat detail</ButtonLink>,
  },
];

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-muted">{children}</Link>;
}
