import { UsersIcon } from "lucide-react";

import { MemberDirectory } from "@/components/members/member-directory";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";
import { listAssignableDepartments, listMembers, listRoles } from "@/lib/members/api";

export default async function MembersPage() {
  const { accessToken, profile } = await wajibSesi();
  const members = await listMembers(accessToken);
  const roles = isManagement(profile) ? await listRoles(accessToken) : [];
  const departments = ["manager", "admin", "superadmin"].includes(profile.role_key)
    ? await listAssignableDepartments(accessToken)
    : [];

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/profile", label: "Profil" }]} current="Ahli" />
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
      <MemberDirectory members={members} profile={profile} roles={roles} departments={departments} />
    </div>
  );
}
