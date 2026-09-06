"use client";

import { useTransition } from "react";
import { AwardIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { MyCertificate } from "@/lib/activities/api";
import { getCertificateFileAction } from "@/lib/activities/actions";
import { formatActivityDate, formatActivityDateTime } from "@/lib/activities/helpers";

export function CertificateList({ certificates }: { certificates: MyCertificate[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certificates.map((certificate) => <CertificateCard key={certificate.id} certificate={certificate} />)}
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: MyCertificate }) {
  const [pending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      const result = await getCertificateFileAction(certificate.id);
      if (!result.ok) {
        toast.error(result.code === "conflict" ? "Sijil masih sedang disediakan. Cuba lagi sebentar." : result.error);
        return;
      }
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <article className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <AwardIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold">{certificate.activity_title}</p>
          <p className="text-sm text-muted-foreground">{certificate.category_name}</p>
        </div>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Tarikh aktiviti</dt>
          <dd className="font-medium">{formatActivityDate(certificate.activity_date)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Dikeluarkan</dt>
          <dd className="font-medium">{formatActivityDateTime(certificate.issued_at)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">No. siri</dt>
          <dd className="font-medium">{certificate.serial || "-"}</dd>
        </div>
      </dl>
      <Button type="button" variant="outline" onClick={download} disabled={pending}>
        <DownloadIcon />
        {pending ? "Menyediakan…" : "Muat turun sijil"}
      </Button>
    </article>
  );
}
