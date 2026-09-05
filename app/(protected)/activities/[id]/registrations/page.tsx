import { UsersIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { AttendanceManager } from "@/components/activities/attendance-manager";
import { getActivity, listActivityRegistrants } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function ActivityRegistrationsPage({
  params,
}: PageProps<"/activities/[id]/registrations">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const [activity, { registrations }] = await Promise.all([
    getActivity(accessToken, id),
    listActivityRegistrants(accessToken, id),
  ]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <UsersIcon className="size-4" />
          Pengurusan aktiviti
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Senarai peserta</h1>
        <p className="text-sm leading-6 text-muted-foreground">{activity.title} · {registrations.length} peserta</p>
      </header>
      <AttendanceManager activityId={activity.id} sessions={activity.sessions} registrants={registrations} />
    </div>
  );
}
