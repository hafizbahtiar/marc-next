import { FileSearchIcon } from "lucide-react";

import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { wajibSesi } from "@/lib/auth/session";
import { isManagement } from "@/lib/api/types";
import { senaraiAudit } from "@/lib/audit/api";

export default async function AuditLogsPage() {
  const { accessToken, profile } = await wajibSesi();

  if (!isManagement(profile)) {
    return (
      <div className="mx-auto grid max-w-3xl gap-4">
        <BackLink href="/profile">Kembali ke Profil</BackLink>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Jejak Audit</h1>
        <p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Anda tiada akses ke skrin ini.
        </p>
      </div>
    );
  }

  const { logs } = await senaraiAudit(accessToken);

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <FileSearchIcon className="size-4" />
          Pengurusan
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Jejak Audit</h1>
      </header>
      {logs.length === 0 ? (
        <p className="rounded-xl border bg-card px-6 py-16 text-center text-sm text-muted-foreground">Tiada catatan.</p>
      ) : (
        <div className="grid gap-3">
          {logs.map((log) => (
            <details key={log.id} className="group rounded-xl border bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <FileSearchIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {labelEntiti(log.entity_type)} {labelTindakan(log.action).toLowerCase()}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {log.actor_member_id ?? "Sistem"} · {new Date(log.created_at).toLocaleString("ms-MY")}
                  </span>
                </span>
                <Badge variant={log.action === "delete" ? "destructive" : "secondary"}>{labelTindakan(log.action)}</Badge>
              </summary>
              <div className="grid gap-2 border-t px-4 py-4 text-xs text-muted-foreground">
                <p>ID entiti: {log.entity_id}</p>
                {log.changed_fields.length > 0 ? <p>Medan: {log.changed_fields.join(", ")}</p> : null}
                {log.actor_role_key ? <p>Role: {log.actor_role_key}</p> : null}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function labelEntiti(value: string) {
  return value === "profile" ? "Ahli" : value === "comment" ? "Comment" : value === "post" ? "Post" : value;
}

function labelTindakan(value: string) {
  return value === "create" ? "Dicipta" : value === "update" ? "Dikemas kini" : value === "delete" ? "Dipadam" : value;
}
