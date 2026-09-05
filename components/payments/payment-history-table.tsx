"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { StatusBadge, statusTone } from "@/components/marc/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DownloadIcon, EyeIcon } from "lucide-react";
import type { PaymentHistory } from "@/lib/payments/api";

type PaymentRow = {
  id: string;
  type: string;
  title: string;
  amount_cents: number;
  currency: string;
  status: string;
  date: string;
  receiptType?: "registration" | "activity" | "donation";
  receiptId?: string;
};

const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bayaran" />,
    cell: ({ row }) => (
      <div className="min-w-48">
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.type}</p>
      </div>
    ),
  },
  {
    accessorKey: "amount_cents",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah" />,
    cell: ({ row }) => `${row.original.currency.toUpperCase()} ${(row.original.amount_cents / 100).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge label={statusLabel(row.original.status)} tone={statusTone(row.original.status)} />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tarikh" />,
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString("ms-MY"),
  },
  {
    id: "receipt",
    header: "Resit",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => row.original.receiptType && row.original.receiptId ? (
      <ReceiptButton type={row.original.receiptType} id={row.original.receiptId} />
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    ),
  },
];

export function PaymentHistoryTable({ history }: { history: PaymentHistory }) {
  const rows: PaymentRow[] = [
    ...history.registration_fee.map((item) => ({
      id: `registration-${item.id}`,
      type: "Yuran pendaftaran",
      title: "Yuran pendaftaran",
      amount_cents: item.amount_cents,
      currency: item.currency,
      status: item.status,
      date: item.created_at,
      receiptType: item.status === "succeeded" ? ("registration" as const) : undefined,
      receiptId: item.status === "succeeded" ? item.id : undefined,
    })),
    ...history.activity_fees.map((item) => ({
      id: `activity-${item.registration_id}`,
      type: "Yuran aktiviti",
      title: item.title,
      amount_cents: item.fee_cents,
      currency: item.currency,
      status: item.payment_status,
      date: item.starts_at,
      receiptType: item.payment_status === "paid" ? ("activity" as const) : undefined,
      receiptId: item.payment_status === "paid" ? item.registration_id : undefined,
    })),
    ...history.donations.map((item) => ({
      id: `donation-${item.id}`,
      type: "Sokongan MARC",
      title: "Sokongan MARC",
      amount_cents: item.amount_cents,
      currency: item.currency,
      status: item.status,
      date: item.created_at,
      receiptType: item.status === "succeeded" ? ("donation" as const) : undefined,
      receiptId: item.status === "succeeded" ? item.id : undefined,
    })),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="title"
      searchPlaceholder="Cari bayaran…"
      emptyMessage="Tiada sejarah bayaran."
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 50]}
      initialPageSize={20}
    />
  );
}

function statusLabel(status: string) {
  if (status === "succeeded" || status === "paid") return "Berjaya";
  if (status === "failed") return "Gagal";
  if (status === "refunded") return "Dikembalikan";
  return "Menunggu";
}

function ReceiptButton({ type, id }: { type: "registration" | "activity" | "donation"; id: string }) {
  const [pending, setPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();

  async function fetchReceipt(preview = false) {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/payments/${type}/${encodeURIComponent(id)}/receipt${preview ? "?preview=1" : ""}`);
      if (!response.ok) throw new Error("receipt-failed");
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1];
      return { blob: await response.blob(), filename };
    } catch {
      toast.error(preview ? "Gagal membuka preview resit." : "Gagal memuat turun resit.");
    } finally {
      setPending(false);
    }
  }

  async function previewReceipt() {
    const result = await fetchReceipt(true);
    if (!result) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(result.blob));
  }

  async function download() {
    const result = await fetchReceipt();
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename ?? `MARC-Resit-${receiptLabel(type)}-${id.slice(0, 8)}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog onOpenChange={(open) => {
        if (!open && previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(undefined);
        }
      }}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void previewReceipt()}>
            <EyeIcon />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[90vh] w-[calc(100%-1rem)] max-w-4xl p-2 sm:p-4">
          <DialogHeader className="px-2 pt-2 sm:px-0 sm:pt-0">
            <DialogTitle>Preview resit</DialogTitle>
            <DialogDescription>Semak resit sebelum memuat turunnya.</DialogDescription>
          </DialogHeader>
          {previewUrl ? (
            <iframe title="Preview resit bayaran" src={previewUrl} className="min-h-0 w-full flex-1 rounded-lg border" />
          ) : (
            <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">Memuat preview…</div>
          )}
        </DialogContent>
      </Dialog>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void download()}>
        <DownloadIcon />
        {pending ? "Memuat…" : "Download"}
      </Button>
    </div>
  );
}

function receiptLabel(type: "registration" | "activity" | "donation") {
  return type === "registration" ? "Yuran-Pendaftaran" : type === "activity" ? "Yuran-Aktiviti" : "Sokongan-MARC";
}
