import { FileSearchIcon } from "lucide-react";

import { AuditLogTable } from "@/components/audit/audit-log-table";
import { BackLink } from "@/components/ui/back-link";
import { wajibSesi } from "@/lib/auth/session";
import { isManagement } from "@/lib/api/types";
import { listAuditLogs } from "@/lib/audit/api";

export default async function AuditLogsPage() {
  const { accessToken, profile } = await wajibSesi();

  if (!isManagement(profile)) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4">
        <BackLink href="/profile">Kembali ke Profil</BackLink>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Jejak Audit</h1>
        <p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Anda tiada akses ke skrin ini.
        </p>
      </div>
    );
  }

  const { logs } = await listAuditLogs(accessToken);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <FileSearchIcon className="size-4" />
          Pengurusan
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Jejak Audit</h1>
      </header>
      <AuditLogTable logs={logs} />
    </div>
  );
}
