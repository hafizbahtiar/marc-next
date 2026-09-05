import { AwardIcon } from "lucide-react";

import { CertificateList } from "@/components/activities/certificate-list";
import { listMyCertificates } from "@/lib/activities/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function MyCertificatesPage() {
  const { accessToken } = await wajibSesi();
  const { certificates } = await listMyCertificates(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <AwardIcon className="size-4" />
          Pencapaian anda
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Sijil Saya</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Akses sijil yang diterbitkan untuk penyertaan aktiviti MARC.
        </p>
      </header>
      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">Belum ada sijil</p>
          <p className="mt-1 text-sm text-muted-foreground">Sijil anda akan muncul di sini selepas diterbitkan.</p>
        </div>
      ) : (
        <CertificateList certificates={certificates} />
      )}
    </div>
  );
}
