import { CalendarDaysIcon } from "lucide-react";
import Link from "next/link";

import { ActivityList } from "@/components/activities/activity-list";
import { Button } from "@/components/ui/button";
import { listActivities, listActivityCategories } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function ActivitiesPage() {
  const { accessToken, profile } = await wajibSesi();
  const [{ activities, next_cursor }, { categories }] = await Promise.all([
    listActivities(accessToken),
    listActivityCategories(accessToken),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <CalendarDaysIcon className="size-4" />
          Komuniti MARC
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Aktiviti</h1>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Temui aktiviti, program dan peluang untuk bersama komuniti MARC.
          </p>
          {isManagement(profile) ? <Button asChild><Link href="/activities/new">Aktiviti baharu</Link></Button> : null}
        </div>
      </header>
      <ActivityList
        initialActivities={activities}
        initialCursor={next_cursor}
        categories={categories}
      />
    </div>
  );
}
