"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityCategory, BlockedDomain, Department } from "@/lib/admin/settings-api";
import { addBlockedDomainAction, createCategoryAction, createDepartmentAction, deleteDepartmentAction, removeBlockedDomainAction, toggleCategoryAction, updateDepartmentAction } from "@/lib/admin/settings-actions";

export function CategoryTable({ rows }: { rows: ActivityCategory[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const run = useCallback((action: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }, [router]);
  const columns = useMemo<ColumnDef<ActivityCategory>[]>(() => [
    { accessorKey: "key", header: ({ column }) => <DataTableColumnHeader column={column} title="Key" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" /> },
    { accessorKey: "sort_order", header: "Susunan" },
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => row.original.is_active ? <Badge variant="outline">Aktif</Badge> : <Badge variant="secondary">Tidak aktif</Badge> },
    {
      id: "actions",
      header: "Tindakan",
      enableHiding: false,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(async () => toggleCategoryAction(row.original.id, !row.original.is_active))}>
          {row.original.is_active ? <XIcon /> : <CheckIcon />}
          {row.original.is_active ? "Nyahaktif" : "Aktifkan"}
        </Button>
      ),
    },
  ], [pending, run]);
  return <ManagementTableShell message={message} actionLabel="Kategori baharu" onAdd={() => {
    const key = window.prompt("Key kategori");
    const name = key && window.prompt("Nama kategori");
    if (key && name) run(() => createCategoryAction(key, name));
  }}><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari kategori…" getRowId={(row) => row.id} /></ManagementTableShell>;
}

export function DomainTable({ rows }: { rows: BlockedDomain[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }
  const columns: ColumnDef<BlockedDomain>[] = [
    { accessorKey: "domain", header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" /> },
    { accessorKey: "created_at", header: "Ditambah", cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("ms-MY") },
    { id: "actions", header: "Tindakan", enableHiding: false, cell: ({ row }) => <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => removeBlockedDomainAction(row.original.domain))}><Trash2Icon /> Buang</Button> },
  ];
  return <ManagementTableShell message={message} actionLabel="Sekat domain" onAdd={() => {
    const domain = window.prompt("Domain emel");
    if (domain) run(() => addBlockedDomainAction(domain.trim().toLowerCase()));
  }}><DataTable columns={columns} data={rows} searchKey="domain" searchPlaceholder="Cari domain…" getRowId={(row) => row.domain} /></ManagementTableShell>;
}

export function DepartmentTable({ rows }: { rows: Department[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }
  const columns: ColumnDef<Department>[] = [
    { accessorKey: "code", header: ({ column }) => <DataTableColumnHeader column={column} title="Kod" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" /> },
    { id: "actions", header: "Tindakan", enableHiding: false, cell: ({ row }) => <div className="flex gap-2"><Button size="sm" variant="outline" disabled={pending} onClick={() => { const name = window.prompt("Nama bahagian", row.original.name); if (name) run(() => updateDepartmentAction(row.original.code, name)); }}><PencilIcon /> Edit</Button><Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => deleteDepartmentAction(row.original.code))}><Trash2Icon /> Buang</Button></div> },
  ];
  return <ManagementTableShell message={message} actionLabel="Bahagian baharu" onAdd={() => {
    const code = window.prompt("Kod bahagian");
    const name = code && window.prompt("Nama bahagian");
    if (code && name) run(() => createDepartmentAction(code.trim().toUpperCase(), name.trim()));
  }}><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari bahagian…" getRowId={(row) => row.code} /></ManagementTableShell>;
}

function ManagementTableShell({ message, actionLabel, onAdd, children }: { message: string; actionLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return <div className="grid gap-3">{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}<div className="flex justify-end"><Button onClick={onAdd}><PlusIcon /> {actionLabel}</Button></div>{children}</div>;
}
