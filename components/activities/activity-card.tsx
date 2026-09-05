import Link from "next/link";
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Activity } from "@/lib/activities/api";
import {
  activityStatusLabel,
  formatActivityDate,
  formatCurrency,
} from "@/lib/activities/helpers";

export function ActivityCard({ activity }: { activity: Activity }) {
  const capacityLabel =
    activity.capacity === null
      ? `${activity.registration_count} peserta`
      : `${activity.registration_count}/${activity.capacity} peserta`;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <Badge variant={activity.status === "cancelled" ? "destructive" : "secondary"}>
            {activity.category_name || activityStatusLabel(activity.status)}
          </Badge>
          {activity.is_registered ? <Badge variant="outline">Anda berdaftar</Badge> : null}
        </div>
        <Link
          href={`/activities/${encodeURIComponent(activity.id)}`}
          className="font-heading text-xl font-semibold leading-tight outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {activity.title}
        </Link>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="grid gap-2 text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 shrink-0 text-primary" />
            {formatActivityDate(activity.starts_at)}
          </p>
          <p className="flex items-center gap-2">
            <MapPinIcon className="size-4 shrink-0 text-primary" />
            <span className="truncate">{activity.location_name || "Lokasi akan diumumkan"}</span>
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className="size-4 shrink-0 text-primary" />
            {capacityLabel}
          </p>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-semibold">
            {activity.fee_cents > 0 ? formatCurrency(activity.fee_cents, activity.currency) : "Percuma"}
          </span>
          <Link
            href={`/activities/${encodeURIComponent(activity.id)}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat butiran
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
