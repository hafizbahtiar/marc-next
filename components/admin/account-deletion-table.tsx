"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountDeletionRequest } from "@/lib/admin/account-deletion-api";
import {
  executeAccountDeletionAction,
  executeDirectAccountDeletionAction,
} from "@/lib/admin/account-deletion-actions";

export function AccountDeletionTable({ rows }: { rows: AccountDeletionRequest[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const columns: ColumnDef<AccountDeletionRequest>[] = [
    {
      id: "member",
      accessorKey: "display_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ahli" />,
      cell: ({ row }) => (
        <div className="grid min-w-48 gap-1">
          <span className="font-medium">{row.original.display_name?.trim() || "Tanpa nama"}</span>
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.member_id ?? "No. ahli belum dijana"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm capitalize">{row.original.status}</span>
      ),
    },
    {
      accessorKey: "requested_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Diminta pada" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.requested_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Tindakan",
      enableSorting: false,
      cell: ({ row }) => (
        <DeleteRequestDialog
          row={row.original}
          onResult={(ok, resultMessage) => {
            setMessage(resultMessage);
            if (ok) router.refresh();
          }}
        />
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      <DataTable
        columns={columns}
        data={rows ?? []}
        emptyMessage="Tiada permintaan pemadaman akaun."
        enablePagination={false}
        className="min-w-0"
      />
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}

function DeleteRequestDialog({
  row,
  onResult,
}: {
  row: AccountDeletionRequest;
  onResult: (ok: boolean, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const confirmed = confirmation.trim().toUpperCase() === "PADAM";

  async function execute() {
    if (!confirmed) return;
    setPending(true);
    const result = await executeAccountDeletionAction(row.user_id);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      setConfirmation("");
    }
    onResult(result.ok, result.message);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2Icon /> Padam akaun
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Padam akaun secara kekal?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Akaun <strong>{row.email}</strong> dan data peribadi berkaitan akan dipadam.
            Rekod audit serta rekod kewangan yang diperlukan akan dikekalkan tanpa pemilik akaun.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <label htmlFor={`delete-confirm-${row.user_id}`} className="text-sm font-medium">
            Taip PADAM untuk meneruskan
          </label>
          <Input
            id={`delete-confirm-${row.user_id}`}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={!confirmed || pending} onClick={(event) => { event.preventDefault(); void execute(); }}>
            {pending ? "Memproses…" : "Padam secara kekal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AccountDeletionTargetTable({ rows }: { rows: AccountDeletionRequest[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const columns: ColumnDef<AccountDeletionRequest>[] = [
    {
      id: "member",
      accessorKey: "display_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ahli" />,
      cell: ({ row }) => (
        <div className="grid min-w-48 gap-1">
          <span className="font-medium">{row.original.display_name?.trim() || "Tanpa nama"}</span>
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.member_id ?? "No. ahli belum dijana"} · {row.original.role_key}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "account_status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status akaun" />,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm capitalize">{row.original.account_status}</span>,
    },
    {
      id: "actions",
      header: "Tindakan",
      enableSorting: false,
      cell: ({ row }) => (
        <DirectDeleteDialog
          row={row.original}
          onResult={(ok, resultMessage) => {
            setMessage(resultMessage);
            if (ok) router.refresh();
          }}
        />
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      <DataTable
        columns={columns}
        data={rows ?? []}
        emptyMessage="Tiada akaun boleh dipadam."
        enablePagination={false}
        className="min-w-0"
      />
    </div>
  );
}

function DirectDeleteDialog({
  row,
  onResult,
}: {
  row: AccountDeletionRequest;
  onResult: (ok: boolean, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const confirmed = confirmation.trim().toUpperCase() === "PADAM";
  const canSubmit = confirmed && reason.trim().length > 0;

  async function execute() {
    if (!canSubmit) return;
    setPending(true);
    const result = await executeDirectAccountDeletionAction(row.user_id, reason);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      setReason("");
      setConfirmation("");
    }
    onResult(result.ok, result.message);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2Icon /> Padam akaun
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Padam akaun secara pentadbiran?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{row.email}</strong> akan dipadam tanpa memerlukan permintaan daripada pemilik akaun.
            Rekod audit dan kewangan yang diperlukan akan dikekalkan tanpa pemilik akaun.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label htmlFor={`delete-reason-${row.user_id}`} className="text-sm font-medium">
              Sebab pemadaman
            </label>
            <Input
              id={`delete-reason-${row.user_id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Contoh: akaun pendua"
              maxLength={500}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor={`direct-delete-confirm-${row.user_id}`} className="text-sm font-medium">
              Taip PADAM untuk meneruskan
            </label>
            <Input
              id={`direct-delete-confirm-${row.user_id}`}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={!canSubmit || pending} onClick={(event) => { event.preventDefault(); void execute(); }}>
            {pending ? "Memproses…" : "Padam secara kekal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
