"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";

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

  return (
    <div className="grid gap-4">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Tiada permintaan pemadaman akaun.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="divide-y">
            {rows.map((row) => (
              <div key={row.user_id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="grid gap-1">
                  <p className="font-medium">{row.display_name?.trim() || "Tanpa nama"}</p>
                  <p className="text-sm text-muted-foreground">{row.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.member_id ?? "No. ahli belum dijana"} · Permintaan{" "}
                    {new Date(row.requested_at).toLocaleDateString("ms-MY")}
                  </p>
                </div>
                <DeleteRequestDialog
                  row={row}
                  onResult={(ok, resultMessage) => {
                    setMessage(resultMessage);
                    if (ok) router.refresh();
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

  return (
    <div className="grid gap-4">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="overflow-hidden rounded-xl border bg-card">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">Tiada akaun boleh dipadam.</p>
        ) : (
          <div className="divide-y">
            {rows.map((row) => (
              <div key={row.user_id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="grid gap-1">
                  <p className="font-medium">{row.display_name?.trim() || "Tanpa nama"}</p>
                  <p className="text-sm text-muted-foreground">{row.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.member_id ?? "No. ahli belum dijana"} · {row.role_key}
                  </p>
                </div>
                <DirectDeleteDialog
                  row={row}
                  onResult={(ok, resultMessage) => {
                    setMessage(resultMessage);
                    if (ok) router.refresh();
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
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
