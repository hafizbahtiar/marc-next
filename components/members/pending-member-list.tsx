"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2Icon, MoreHorizontalIcon, ShieldCheckIcon, XCircleIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/marc/data-table";
import type { MemberRow } from "@/lib/api/types";
import {
  approveMemberAction,
  cancelRegistrationBillAction,
  rejectMemberAction,
  verifyStaffAction,
} from "@/lib/members/actions";

type MemberAction = (id: string) => Promise<{ ok: boolean; mesej: string }>;

export function PendingMemberList({
  members,
  canVerifyStaff,
  canCancelBill,
}: {
  members: MemberRow[];
  canVerifyStaff: boolean;
  canCancelBill: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState<{ question: string; action: MemberAction; id: string } | null>(null);

  const run = useCallback((action: MemberAction, id: string) => {
    startTransition(async () => {
      const result = await action(id);
      setMessage(result.mesej);
      if (result.ok) router.refresh();
    });
  }, [router]);

  const columns = useMemo<ColumnDef<MemberRow>[]>(() => [
    {
      accessorKey: "display_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ahli" />,
      cell: ({ row }) => {
        const member = row.original;
        const name = member.display_name?.trim() || member.member_id || "Belum disahkan";
        return (
          <div className="flex min-w-52 items-center gap-3">
            <Avatar className="size-9">
              {member.avatar_url ? <AvatarImage src={member.avatar_url} alt="" /> : null}
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.email ?? "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "staff_id",
      header: "No. staff",
      cell: ({ row }) => (
        <div>
          <p>{row.original.staff_id ?? "—"}</p>
          {row.original.staff_id_verified_at ? <Badge variant="outline" className="mt-1">Disahkan</Badge> : null}
        </div>
      ),
    },
    {
      accessorKey: "registration_payment_status",
      header: "Bayaran",
      cell: ({ row }) => {
        const status = row.original.registration_payment_status;
        return <Badge variant={status === "pending" ? "outline" : "secondary"}>{status === "pending" ? "Bil aktif" : status === "succeeded" ? "Dibayar" : "Belum bayar"}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Tindakan",
      enableHiding: false,
      cell: ({ row }) => {
        const member = row.original;
        const name = member.display_name?.trim() || member.member_id || "ahli ini";
        const verified = Boolean(member.staff_id_verified_at);
        const billPending = member.registration_payment_status === "pending";
        return (
          <div className="flex min-w-64 flex-wrap gap-2">
            {!verified && canVerifyStaff ? (
              <Button size="sm" variant="outline" disabled={pending} onClick={() => run(verifyStaffAction, member.user_id)}>
                <ShieldCheckIcon /> Sahkan
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={pending || !verified}
              onClick={() => setConfirmation({ question: `Luluskan pendaftaran ${name}?`, action: approveMemberAction, id: member.user_id })}
            >
              <CheckCircle2Icon /> Lulus
            </Button>
            {canCancelBill && billPending ? (
              <Button size="sm" variant="outline" disabled={pending} onClick={() => run(cancelRegistrationBillAction, member.user_id)}>
                <MoreHorizontalIcon /> Batal bil
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => setConfirmation({ question: `Tolak pendaftaran ${name}?`, action: rejectMemberAction, id: member.user_id })}
            >
              <XCircleIcon /> Tolak
            </Button>
          </div>
        );
      },
    },
  ], [canCancelBill, canVerifyStaff, pending, run]);

  return (
    <div className="grid gap-3">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <DataTable
        columns={columns}
        data={members}
        searchKey="display_name"
        searchPlaceholder="Cari ahli pending…"
        emptyMessage="Tiada ahli menunggu kelulusan."
        getRowId={(member) => member.user_id}
        pageSizeOptions={[10, 20, 50]}
        initialPageSize={20}
      />
      <AlertDialog open={Boolean(confirmation)} onOpenChange={(open) => !open && setConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sahkan tindakan</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.question}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                if (!confirmation) return;
                run(confirmation.action, confirmation.id);
                setConfirmation(null);
              }}
            >
              Teruskan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
