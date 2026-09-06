"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcwIcon, ShieldBanIcon } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BannedMember } from "@/lib/admin/member-bans-api";
import { unbanMemberAction } from "@/lib/admin/member-bans-actions";

export function BannedMembersTable({ members }: { members: BannedMember[] }) {
  const [message, setMessage] = useState("");
  const permanent = members.filter((member) => member.ban_expires_at === null);
  const temporary = members.filter((member) => member.ban_expires_at !== null);

  return (
    <div className="grid gap-4">
      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      <Tabs defaultValue="permanent" className="min-w-0">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="permanent">
            Permanent <Badge variant="secondary">{permanent.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="temporary">
            Tidak permanent <Badge variant="secondary">{temporary.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="permanent">
          <BannedMembersDataTable
            members={permanent}
            emptyMessage="Tiada akaun yang digantung secara permanent."
            onResult={setMessage}
          />
        </TabsContent>
        <TabsContent value="temporary">
          <BannedMembersDataTable
            members={temporary}
            emptyMessage="Tiada akaun yang digantung secara sementara."
            onResult={setMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BannedMembersDataTable({
  members,
  emptyMessage,
  onResult,
}: {
  members: BannedMember[];
  emptyMessage: string;
  onResult: (message: string) => void;
}) {
  const columns: ColumnDef<BannedMember>[] = [
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
      accessorKey: "ban_reason",
      header: "Sebab",
      cell: ({ row }) => <span className="max-w-64 text-sm">{row.original.ban_reason}</span>,
    },
    {
      accessorKey: "banned_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Digantung pada" />,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.banned_at)}</span>,
    },
    {
      accessorKey: "ban_expires_at",
      header: "Tamat",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.original.ban_expires_at ? formatDate(row.original.ban_expires_at) : "Tiada"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Tindakan",
      enableSorting: false,
      cell: ({ row }) => <UnbanDialog member={row.original} onResult={onResult} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={members}
      emptyMessage={emptyMessage}
      enablePagination={false}
      className="min-w-0"
    />
  );
}

function UnbanDialog({ member, onResult }: { member: BannedMember; onResult: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function unban() {
    setPending(true);
    const result = await unbanMemberAction(member.user_id);
    setPending(false);
    if (result.ok) setOpen(false);
    onResult(result.message);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm"><RotateCcwIcon /> Buka ban</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><ShieldBanIcon /> Buka penggantungan?</AlertDialogTitle>
          <AlertDialogDescription>
            Akaun <strong>{member.email}</strong> akan boleh log masuk semula selepas ban dibuka.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); void unban(); }}>
            {pending ? "Memproses…" : "Buka ban"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
