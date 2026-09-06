"use client";

import { useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { ResponsiveDetailsSheet } from "@/components/marc/responsive-sheet";
import { StatusBadge, statusTone } from "@/components/marc/status-badge";
import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentLog } from "@/lib/payments/api";
import { loadAdminPaymentLogsAction, reconcilePaymentsAction } from "@/lib/payments/actions";

const PAGE_SIZE = 50;

export function AdminPaymentLogTable({
  initialLogs,
  isSuperAdmin,
}: {
  initialLogs: PaymentLog[];
  isSuperAdmin: boolean;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [module, setModule] = useState("all");
  const [pending, startTransition] = useTransition();
  const hasMore = logs.length > 0 && logs.length % PAGE_SIZE === 0;

  const columns = useMemo<ColumnDef<PaymentLog>[]>(() => [
    {
      accessorKey: "module",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modul" />,
      cell: ({ row }) => moduleLabel(row.original.module),
    },
    {
      accessorKey: "event",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
      cell: ({ row }) => eventLabel(row.original.event),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge label={row.original.status} tone={statusTone(row.original.status)} />,
    },
    {
      accessorKey: "amount_cents",
      header: "Jumlah",
      cell: ({ row }) => row.original.amount_cents === null ? "-" : formatMoney(row.original.amount_cents),
    },
    {
      accessorKey: "gateway",
      header: "Gateway",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Masa" />,
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "detail",
      header: "Detail",
      enableHiding: false,
      cell: ({ row }) => (
        <ResponsiveDetailsSheet
          title="Detail bayaran"
          description={`${moduleLabel(row.original.module)} · ${eventLabel(row.original.event)}`}
          trigger={<Button type="button" size="sm" variant="outline"><EyeIcon /> Lihat</Button>}
        >
          <div className="grid gap-3 text-sm">
            <Detail label="ID log" value={String(row.original.id)} />
            <Detail label="Status" value={row.original.status} />
            <Detail label="Gateway" value={row.original.gateway} />
            <Detail label="Gateway reference" value={row.original.gateway_ref ?? "-"} />
            <Detail label="User ID" value={row.original.user_id ?? "-"} />
            <Detail label="Related ID" value={row.original.related_id ?? "-"} />
            <Detail label="Mesej" value={row.original.message ?? "-"} />
            <Detail label="Masa" value={formatDate(row.original.created_at)} />
          </div>
        </ResponsiveDetailsSheet>
      ),
    },
  ], []);

  function loadFirst(nextModule: string) {
    startTransition(async () => {
      const result = await loadAdminPaymentLogsAction(nextModule === "all" ? {} : { module: nextModule });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setModule(nextModule);
      setLogs(result.data.logs);
    });
  }

  function loadMore() {
    const beforeId = logs.at(-1)?.id;
    if (!beforeId) return;
    startTransition(async () => {
      const result = await loadAdminPaymentLogsAction({
        module: module === "all" ? undefined : module,
        beforeId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLogs((current) => [...current, ...result.data.logs]);
    });
  }

  function reconcile() {
    startTransition(async () => {
      const result = await reconcilePaymentsAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Reconcile selesai: ${result.data.checked} diperiksa, ${result.data.mismatches_fixed} dibetulkan.`);
      loadFirst(module);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={module} onValueChange={loadFirst} disabled={pending}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Pilih modul" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua modul</SelectItem>
            <SelectItem value="registration_fee">Yuran pendaftaran</SelectItem>
            <SelectItem value="activity_fee">Yuran aktiviti</SelectItem>
            {isSuperAdmin ? <SelectItem value="donation">Donation</SelectItem> : null}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" disabled={pending} onClick={reconcile}>
          <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
          Jalankan reconcile
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        searchKey="event"
        searchPlaceholder="Cari event…"
        emptyMessage="Tiada rekod bayaran."
        getRowId={(row) => String(row.id)}
        pageSizeOptions={[10, 20, 50]}
        initialPageSize={20}
      />
      {hasMore ? (
        <Button type="button" variant="outline" className="mx-auto" disabled={pending} onClick={loadMore}>
          {pending ? "Memuat…" : "Muat rekod lama"}
        </Button>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-b pb-2 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className="break-all">{value}</span></div>;
}

function moduleLabel(value: string): string {
  return value === "registration_fee" ? "Yuran pendaftaran" : value === "activity_fee" ? "Yuran aktiviti" : value === "donation" ? "Donation" : value;
}

function eventLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(cents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
