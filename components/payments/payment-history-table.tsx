"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { StatusBadge, statusTone } from "@/components/marc/status-badge";
import type { PaymentHistory } from "@/lib/payments/api";

type PaymentRow = {
  id: string;
  type: string;
  title: string;
  amount_cents: number;
  currency: string;
  status: string;
  date: string;
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
    })),
    ...history.activity_fees.map((item) => ({
      id: `activity-${item.registration_id}`,
      type: "Yuran aktiviti",
      title: item.title,
      amount_cents: item.fee_cents,
      currency: item.currency,
      status: item.payment_status,
      date: item.starts_at,
    })),
    ...history.donations.map((item) => ({
      id: `donation-${item.id}`,
      type: "Sokongan MARC",
      title: "Sokongan MARC",
      amount_cents: item.amount_cents,
      currency: item.currency,
      status: item.status,
      date: item.created_at,
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
