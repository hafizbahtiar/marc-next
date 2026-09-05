import { Clock3Icon } from "lucide-react";

import { PendingMemberList } from "@/components/members/pending-member-list";
import { BackLink } from "@/components/ui/back-link";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";
import { listPendingMembers } from "@/lib/members/api";

export default async function PendingMembersPage() {
  const { accessToken, profile } = await wajibSesi();

  if (!isManagement(profile)) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4">
        <BackLink href="/profile">Kembali ke Profil</BackLink>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Ahli Pending</h1>
        <p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Anda tiada akses ke skrin ini.
        </p>
      </div>
    );
  }

  const members = await listPendingMembers(accessToken);
  const canVerifyStaff = ["manager", "admin", "superadmin"].includes(profile.role_key);
  const canCancelBill = ["admin", "superadmin"].includes(profile.role_key);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock3Icon className="size-4" />
          Pengurusan
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Ahli Pending</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Sahkan nombor staff sebelum meluluskan pendaftaran ahli.
        </p>
      </header>
      <PendingMemberList
        members={members}
        canVerifyStaff={canVerifyStaff}
        canCancelBill={canCancelBill}
      />
    </div>
  );
}
