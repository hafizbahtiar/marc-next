import {
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ActivityActions } from "@/components/activities/activity-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { isManagement } from "@/lib/api/types";
import { getActivity } from "@/lib/activities/api";
import {
  activityStatusLabel,
  formatActivityDate,
  formatActivityDateTime,
  formatCurrency,
} from "@/lib/activities/helpers";
import { wajibSesi } from "@/lib/auth/session";

export default async function ActivityDetailPage({ params }: PageProps<"/activities/[id]">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();

  let activity;
  try {
    activity = await getActivity(accessToken, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const capacityLabel =
    activity.capacity === null
      ? `${activity.registration_count} peserta`
      : `${activity.registration_count} daripada ${activity.capacity} peserta`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {activity.category_name ? <Badge variant="secondary">{activity.category_name}</Badge> : null}
          <Badge variant={activity.status === "cancelled" ? "destructive" : "outline"}>
            {activityStatusLabel(activity.status)}
          </Badge>
        </div>
        <h1 className="max-w-4xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {activity.title}
        </h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <Card>
            <CardContent className="grid gap-5 p-6">
              <div className="grid gap-3 text-sm">
                <InfoRow icon={CalendarDaysIcon} label="Tarikh" value={formatActivityDate(activity.starts_at)} />
                <InfoRow icon={Clock3Icon} label="Masa" value={`${formatActivityDateTime(activity.starts_at)} – ${formatActivityDateTime(activity.ends_at)}`} />
                <InfoRow icon={MapPinIcon} label="Lokasi" value={[activity.location_name, activity.location_address].filter(Boolean).join(", ") || "Akan diumumkan"} />
                <InfoRow icon={UsersIcon} label="Kapasiti" value={capacityLabel} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Tentang aktiviti</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {activity.description || "Tiada penerangan disediakan."}
              </p>
            </CardContent>
          </Card>

          {activity.sessions.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="text-lg">Sesi aktiviti</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {activity.sessions
                  .slice()
                  .sort((a, b) => a.seq - b.seq)
                  .map((session) => (
                    <div key={session.id} className="grid gap-1 rounded-xl bg-muted/50 p-4">
                      <p className="font-medium">{session.title || `Sesi ${session.seq}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatActivityDateTime(session.starts_at)} – {formatActivityDateTime(session.ends_at)}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activity.fee_cents > 0 ? formatCurrency(activity.fee_cents, activity.currency) : "Percuma"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Pendaftaran ditutup pada {formatActivityDateTime(activity.registration_closes_at)}.
              </p>
            </CardHeader>
            <CardContent>
              <ActivityActions activity={activity} />
              {isManagement(profile) ? (
                <div className="mt-4 grid gap-2 border-t pt-4">
                  <Button asChild variant="outline">
                    <a href={`/activities/${encodeURIComponent(activity.id)}/edit`}>Sunting aktiviti</a>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href={`/activities/${encodeURIComponent(activity.id)}/registrations`}>Senarai peserta</a>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href={`/activities/${encodeURIComponent(activity.id)}/certificates`}>Terbitkan sijil</a>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDaysIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium">{value}</span>
    </div>
  );
}
