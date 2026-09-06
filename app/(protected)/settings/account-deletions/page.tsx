import { UserRoundXIcon } from "lucide-react";

import {
  AccountDeletionTable,
  AccountDeletionTargetTable,
} from "@/components/admin/account-deletion-table";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wajibSesi } from "@/lib/auth/session";
import {
  listAccountDeletionRequests,
  listAccountDeletionTargets,
} from "@/lib/admin/account-deletion-api";

export default async function AccountDeletionsPage() {
  const { accessToken, profile } = await wajibSesi();
  if (profile.role_key !== "superadmin") {
    return <AccessDenied />;
  }

  const [{ requests }, { accounts }] = await Promise.all([
    listAccountDeletionRequests(accessToken),
    listAccountDeletionTargets(accessToken),
  ]);
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Pemadaman akaun" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-destructive">
          <UserRoundXIcon className="size-4" /> Zon pemadaman
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Pemadaman akaun</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Semak dan proses permintaan pemadaman data ahli. Tindakan ini kekal dan
          tidak boleh dibuat asal.
        </p>
      </header>
      <Tabs defaultValue="requests" className="min-w-0">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="requests">Permintaan ahli</TabsTrigger>
          <TabsTrigger value="administrative">Pemadaman pentadbiran</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Ahli yang telah meminta akaun dan data mereka dipadam.
          </p>
          <AccountDeletionTable rows={requests} />
        </TabsContent>
        <TabsContent value="administrative" className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Pemadaman yang dimulakan superadmin. Sebab dan tindakan akan direkodkan dalam audit.
          </p>
          <AccountDeletionTargetTable rows={accounts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Pemadaman akaun" />
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Pemadaman akaun</h1>
      <p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Skrin ini untuk superadmin sahaja.
      </p>
    </div>
  );
}
