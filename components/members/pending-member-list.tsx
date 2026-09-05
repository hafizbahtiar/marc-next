"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2Icon, MoreHorizontalIcon, ShieldCheckIcon, XCircleIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MemberRow } from "@/lib/api/types";
import {
  batalkanBilAction,
  lulusAhliAction,
  sahkanStaffAction,
  tolakAhliAction,
} from "@/lib/members/actions";

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

  function run(action: (id: string) => Promise<{ ok: boolean; mesej: string }>, id: string) {
    startTransition(async () => {
      const result = await action(id);
      setMessage(result.mesej);
      if (result.ok) router.refresh();
    });
  }

  if (members.length === 0) {
    return <p className="rounded-xl border bg-card px-6 py-16 text-center text-sm text-muted-foreground">Tiada ahli menunggu kelulusan.</p>;
  }

  return (
    <div className="grid gap-3">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="divide-y">
          {members.map((member) => {
            const name = member.display_name?.trim() || member.member_id || "Belum disahkan";
            const verified = Boolean(member.staff_id_verified_at);
            const billPending = member.registration_payment_status === "pending";
            return (
              <div key={member.user_id} className="grid gap-3 px-4 py-4 sm:flex sm:items-center">
                <Avatar className="size-10">
                  {member.avatar_url ? <AvatarImage src={member.avatar_url} alt="" /> : null}
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.member_id ?? "Belum disahkan"} · Staff: {member.staff_id ?? "-"}
                  </p>
                  {member.email ? <p className="truncate text-xs text-muted-foreground">{member.email}</p> : null}
                </div>
                <Badge variant={billPending ? "outline" : "secondary"}>
                  {billPending ? "Bil aktif" : member.registration_payment_status === "succeeded" ? "Dibayar" : "Belum bayar"}
                </Badge>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {!verified && canVerifyStaff ? (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(sahkanStaffAction, member.user_id)}>
                      <ShieldCheckIcon />
                      Sahkan staff
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    disabled={pending || !verified}
                    onClick={() => {
                      if (window.confirm(`Luluskan pendaftaran ${name}?`)) run(lulusAhliAction, member.user_id);
                    }}
                  >
                    <CheckCircle2Icon />
                    Lulus
                  </Button>
                  {canCancelBill && billPending ? (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(batalkanBilAction, member.user_id)}>
                      <MoreHorizontalIcon />
                      Batal bil
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Tolak pendaftaran ${name}?`)) run(tolakAhliAction, member.user_id);
                    }}
                  >
                    <XCircleIcon />
                    Tolak
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
