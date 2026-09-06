import { QrCodeIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { QrScanner } from "@/components/activities/qr-scanner";
import { getActivity } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function ManagementScanPage({
  params,
}: PageProps<"/activities/[id]/sessions/[sessionId]/scan">) {
  const { id, sessionId } = await params;
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const activity = await getActivity(accessToken, id);
  const session = activity.sessions.find((item) => item.id === sessionId);
  if (!session) notFound();

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <header className="grid gap-2 text-center">
        <p className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><QrCodeIcon /></p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Imbas QR ahli</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {activity.title} · {session.title || `Sesi ${session.seq}`}
        </p>
      </header>
      <QrScanner mode="management" activityId={id} sessionId={sessionId} />
    </div>
  );
}
