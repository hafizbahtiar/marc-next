import { UsersIcon } from "lucide-react";

import { MemberDirectory } from "@/components/members/member-directory";
import { BackLink } from "@/components/ui/back-link";
import { wajibSesi } from "@/lib/auth/session";
import { listMembers } from "@/lib/members/api";

export default async function MembersPage() {
  const { accessToken } = await wajibSesi();
  const members = await listMembers(accessToken);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <UsersIcon className="size-4" />
          Komuniti
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Ahli</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Cari ahli MARC mengikut nama, nombor ahli, atau bahagian.
        </p>
      </header>
      <MemberDirectory members={members} />
    </div>
  );
}
