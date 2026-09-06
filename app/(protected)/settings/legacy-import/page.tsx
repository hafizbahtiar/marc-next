import { FileUpIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { LegacyImportConsole } from "@/components/admin/legacy-import-console";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { listLegacyImportBatches } from "@/lib/admin/legacy-import-api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function LegacyImportPage() {
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile) || profile.role_key !== "superadmin") notFound();
  const { batches } = await listLegacyImportBatches(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Import ahli lama" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <FileUpIcon className="size-4" />
          Migrasi data
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Import ahli lama</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Semak data CSV MARC lama sebelum memadankan akaun. Konflik ID staff, emel atau nombor ahli mesti diselesaikan dahulu.
        </p>
      </header>
      <LegacyImportConsole batches={batches} />
    </div>
  );
}
