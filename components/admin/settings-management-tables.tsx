"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { ResponsiveFormSheet } from "@/components/marc/responsive-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityCategory, BlockedDomain, Department } from "@/lib/admin/settings-api";
import { addBlockedDomainAction, createCategoryAction, createDepartmentAction, deleteDepartmentAction, removeBlockedDomainAction, toggleCategoryAction, updateDepartmentAction } from "@/lib/admin/settings-actions";

export function CategoryTable({ rows }: { rows: ActivityCategory[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const execute = useCallback(async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action();
    setMessage(result.message);
    if (result.ok) router.refresh();
    return result;
  }, [router]);
  const run = useCallback((action: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(() => { void execute(action); });
  }, [execute]);
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
  return <ManagementTableShell message={message} action={
    <ResponsiveFormSheet
      title="Kategori baharu"
      description="Tambah kategori untuk aktiviti."
      trigger={<Button><PlusIcon /> Kategori baharu</Button>}
      submitLabel="Tambah kategori"
      fields={[{ name: "key", label: "Key", placeholder: "contoh: mesyuarat" }, { name: "name", label: "Nama kategori" }]}
      onSubmit={(values) => execute(() => createCategoryAction(values.key, values.name))}
    />
  }><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari kategori…" getRowId={(row) => row.id} /></ManagementTableShell>;
}

export function DomainTable({ rows }: { rows: BlockedDomain[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const execute = useCallback(async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action();
    setMessage(result.message);
    if (result.ok) router.refresh();
    return result;
  }, [router]);
  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(() => { void execute(action); });
  }
  const columns: ColumnDef<BlockedDomain>[] = [
    { accessorKey: "domain", header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" /> },
    { accessorKey: "created_at", header: "Ditambah", cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("ms-MY") },
    { id: "actions", header: "Tindakan", enableHiding: false, cell: ({ row }) => <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => removeBlockedDomainAction(row.original.domain))}><Trash2Icon /> Buang</Button> },
  ];
  return <ManagementTableShell message={message} action={
    <ResponsiveFormSheet
      title="Sekat domain emel"
      description="Pendaftaran menggunakan domain ini akan disekat."
      trigger={<Button><PlusIcon /> Sekat domain</Button>}
      submitLabel="Sekat domain"
      fields={[{ name: "domain", label: "Domain emel", placeholder: "contoh: example.com" }]}
      onSubmit={(values) => execute(() => addBlockedDomainAction(values.domain.trim().toLowerCase()))}
    />
  }><DataTable columns={columns} data={rows} searchKey="domain" searchPlaceholder="Cari domain…" getRowId={(row) => row.domain} /></ManagementTableShell>;
}

export function DepartmentTable({ rows }: { rows: Department[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const execute = useCallback(async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action();
    setMessage(result.message);
    if (result.ok) router.refresh();
    return result;
  }, [router]);
  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(() => { void execute(action); });
  }
  const columns: ColumnDef<Department>[] = [
    { accessorKey: "code", header: ({ column }) => <DataTableColumnHeader column={column} title="Kod" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" /> },
    {
      id: "actions",
      header: "Tindakan",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <ResponsiveFormSheet
            title="Edit bahagian"
            description={`Kemas kini nama untuk ${row.original.code}.`}
            trigger={<Button size="sm" variant="outline" disabled={pending}><PencilIcon /> Edit</Button>}
            submitLabel="Simpan perubahan"
            fields={[{ name: "name", label: "Nama bahagian", defaultValue: row.original.name }]}
            onSubmit={(values) => execute(() => updateDepartmentAction(row.original.code, values.name.trim()))}
          />
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => deleteDepartmentAction(row.original.code))}><Trash2Icon /> Buang</Button>
        </div>
      ),
    },
  ];
  return <ManagementTableShell message={message} action={
    <ResponsiveFormSheet
      title="Bahagian baharu"
      description="Tambah bahagian atau jabatan organisasi."
      trigger={<Button><PlusIcon /> Bahagian baharu</Button>}
      submitLabel="Tambah bahagian"
      fields={[{ name: "code", label: "Kod", placeholder: "contoh: IT" }, { name: "name", label: "Nama bahagian" }]}
      onSubmit={(values) => execute(() => createDepartmentAction(values.code.trim().toUpperCase(), values.name.trim()))}
    />
  }><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari bahagian…" getRowId={(row) => row.code} /></ManagementTableShell>;
}

function ManagementTableShell({ message, action, children }: { message: string; action: React.ReactNode; children: React.ReactNode }) {
  return <div className="grid gap-3">{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}<div className="flex justify-end">{action}</div>{children}</div>;
}
