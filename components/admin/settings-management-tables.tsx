"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { ResponsiveFormSheet } from "@/components/marc/responsive-sheet";
import { StatusBadge } from "@/components/marc/status-badge";
import { Button } from "@/components/ui/button";
import type { ActivityCategory, BlockedDomain, Department } from "@/lib/admin/settings-api";
import { addBlockedDomainAction, createCategoryAction, createDepartmentAction, deleteDepartmentAction, removeBlockedDomainAction, toggleCategoryAction, updateCategoryAction, updateDepartmentAction } from "@/lib/admin/settings-actions";

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
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => row.original.is_active ? <StatusBadge label="Aktif" tone="success" /> : <StatusBadge label="Tidak aktif" tone="danger" /> },
    {
      id: "actions",
      header: "Tindakan",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <ResponsiveFormSheet
            title="Edit kategori"
            description={`Kemas kini kategori ${row.original.key}.`}
            trigger={<Button size="sm" variant="outline" disabled={pending}><PencilIcon /> Edit</Button>}
            submitLabel="Simpan perubahan"
            fields={[
              { name: "name", label: "Nama kategori", defaultValue: row.original.name },
              { name: "sort_order", label: "Susunan", defaultValue: String(row.original.sort_order), placeholder: "0" },
            ]}
            onSubmit={(values) => execute(() => updateCategoryAction(row.original.id, values.name.trim(), Number(values.sort_order) || 0, row.original.updated_at))}
          />
          {row.original.is_active ? (
            <ConfirmationDialog
              title="Padam kategori?"
              description={`Kategori ${row.original.name} akan dinyahaktifkan. Aktiviti sedia ada tidak akan terjejas.`}
              confirmLabel="Padam kategori"
              trigger={<Button size="sm" variant="destructive" disabled={pending}><Trash2Icon /> Padam</Button>}
              onConfirm={async () => (await execute(() => toggleCategoryAction(row.original.id, false, row.original.updated_at))).ok}
            />
          ) : (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => toggleCategoryAction(row.original.id, true, row.original.updated_at))}>
              <CheckIcon /> Pulihkan
            </Button>
          )}
        </div>
      ),
    },
  ], [execute, pending, run]);
  const action = (
    <ResponsiveFormSheet
      title="Kategori baharu"
      description="Tambah kategori untuk aktiviti."
      trigger={<Button><PlusIcon /> Kategori baharu</Button>}
      submitLabel="Tambah kategori"
      fields={[{ name: "key", label: "Key", placeholder: "contoh: mesyuarat" }, { name: "name", label: "Nama kategori" }]}
      onSubmit={(values) => execute(() => createCategoryAction(values.key, values.name))}
    />
  );
  return <ManagementTableShell message={message}><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari kategori…" getRowId={(row) => row.id} toolbar={action} /></ManagementTableShell>;
}

export function DomainTable({ rows }: { rows: BlockedDomain[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const execute = useCallback(async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action();
    setMessage(result.message);
    if (result.ok) router.refresh();
    return result;
  }, [router]);
  const columns: ColumnDef<BlockedDomain>[] = [
    { accessorKey: "domain", header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" /> },
    { accessorKey: "created_at", header: "Ditambah", cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("ms-MY") },
    {
      id: "actions",
      header: "Tindakan",
      enableHiding: false,
      cell: ({ row }) => (
        <ConfirmationDialog
          title="Buang sekatan domain?"
          description={`Domain ${row.original.domain} akan dibenarkan semula untuk pendaftaran.`}
          confirmLabel="Buang sekatan"
          trigger={<Button size="sm" variant="destructive"><Trash2Icon /> Buang</Button>}
          onConfirm={async () => (await execute(() => removeBlockedDomainAction(row.original.domain))).ok}
        />
      ),
    },
  ];
  const action = (
    <ResponsiveFormSheet
      title="Sekat domain emel"
      description="Pendaftaran menggunakan domain ini akan disekat."
      trigger={<Button><PlusIcon /> Sekat domain</Button>}
      submitLabel="Sekat domain"
      fields={[{ name: "domain", label: "Domain emel", placeholder: "contoh: example.com" }]}
      onSubmit={(values) => execute(() => addBlockedDomainAction(values.domain.trim().toLowerCase()))}
    />
  );
  return <ManagementTableShell message={message}><DataTable columns={columns} data={rows} searchKey="domain" searchPlaceholder="Cari domain…" getRowId={(row) => row.domain} toolbar={action} /></ManagementTableShell>;
}

export function DepartmentTable({ rows }: { rows: Department[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const execute = useCallback(async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action();
    setMessage(result.message);
    if (result.ok) router.refresh();
    return result;
  }, [router]);
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
            trigger={<Button size="sm" variant="outline"><PencilIcon /> Edit</Button>}
            submitLabel="Simpan perubahan"
            fields={[{ name: "name", label: "Nama bahagian", defaultValue: row.original.name }]}
            onSubmit={(values) => execute(() => updateDepartmentAction(row.original.code, values.name.trim()))}
          />
          <ConfirmationDialog
            title="Buang bahagian?"
            description={`Bahagian ${row.original.code} akan dibuang daripada rujukan organisasi.`}
            confirmLabel="Buang bahagian"
            trigger={<Button size="sm" variant="destructive"><Trash2Icon /> Buang</Button>}
            onConfirm={async () => (await execute(() => deleteDepartmentAction(row.original.code))).ok}
          />
        </div>
      ),
    },
  ];
  const action = (
    <ResponsiveFormSheet
      title="Bahagian baharu"
      description="Tambah bahagian atau jabatan organisasi."
      trigger={<Button><PlusIcon /> Bahagian baharu</Button>}
      submitLabel="Tambah bahagian"
      fields={[{ name: "code", label: "Kod", placeholder: "contoh: IT" }, { name: "name", label: "Nama bahagian" }]}
      onSubmit={(values) => execute(() => createDepartmentAction(values.code.trim().toUpperCase(), values.name.trim()))}
    />
  );
  return <ManagementTableShell message={message}><DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Cari bahagian…" getRowId={(row) => row.code} toolbar={action} /></ManagementTableShell>;
}

function ManagementTableShell({ message, children }: { message: string; children: React.ReactNode }) {
  return <div className="grid gap-3">{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}{children}</div>;
}
