import { ShieldBanIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { BannedMembersTable } from "@/components/admin/banned-members-table";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { isManagement } from "@/lib/api/types";
import { listBannedMembers } from "@/lib/admin/member-bans-api";
import { wajibSesi } from "@/lib/auth/session";

export default async function BannedMembersPage() {
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile) || profile.role_key !== "superadmin") notFound();

  const { members } = await listBannedMembers(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Akaun digantung" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-destructive">
          <ShieldBanIcon className="size-4" /> Keselamatan akaun
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Akaun digantung</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Urus akaun yang tidak dibenarkan mengakses MARC buat sementara atau secara permanent.
        </p>
      </header>
      <BannedMembersTable members={members} />
    </div>
  );
}
