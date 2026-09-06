import { MailWarningIcon } from "lucide-react";

import { DomainTable } from "@/components/admin/settings-management-tables";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { wajibSesi } from "@/lib/auth/session";
import { listBlockedDomains } from "@/lib/admin/settings-api";

export default async function BlockedEmailDomainsPage() {
  const { accessToken, profile } = await wajibSesi();
  if (profile.role_key !== "superadmin") {
    return <AccessDenied />;
  }
  const { domains } = await listBlockedDomains(accessToken);
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Domain emel disekat" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary"><MailWarningIcon className="size-4" /> Sistem</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Domain Emel Disekat</h1>
        <p className="text-sm text-muted-foreground">Domain tambahan yang tidak dibenarkan untuk pendaftaran.</p>
      </header>
      <DomainTable rows={domains} />
    </div>
  );
}

function AccessDenied() {
  return <div className="mx-auto grid max-w-6xl gap-4"><PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Domain emel disekat" /><h1 className="font-heading text-3xl font-semibold tracking-tight">Domain Emel Disekat</h1><p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Skrin ini untuk superadmin sahaja.</p></div>;
}
