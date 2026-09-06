import { AwardIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { CertificateIssuer } from "@/components/activities/certificate-issuer";
import { getActivity } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function ActivityCertificatesPage({
  params,
}: PageProps<"/activities/[id]/certificates">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const activity = await getActivity(accessToken, id);

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <AwardIcon className="size-4" />
          Pengurusan aktiviti
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Terbitkan sijil</h1>
        <p className="text-sm leading-6 text-muted-foreground">{activity.title}</p>
      </header>
      <CertificateIssuer activity={activity} />
    </div>
  );
}
