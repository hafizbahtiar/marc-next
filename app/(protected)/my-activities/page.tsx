import { CalendarCheck2Icon } from "lucide-react";
import Link from "next/link";

import { MyActivityList } from "@/components/activities/my-activity-list";
import { Button } from "@/components/ui/button";
import { listMyActivities } from "@/lib/activities/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function MyActivitiesPage() {
  const { accessToken } = await wajibSesi();
  const { registrations } = await listMyActivities(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <CalendarCheck2Icon className="size-4" />
          Komuniti MARC
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Aktiviti Saya</h1>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Lihat pendaftaran, bayaran dan aktiviti yang pernah anda sertai.
          </p>
          <Button asChild variant="outline"><Link href="/checkin">Daftar hadir</Link></Button>
        </div>
      </header>
      {registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">Belum ada aktiviti</p>
          <p className="mt-1 text-sm text-muted-foreground">Aktiviti yang anda daftar akan muncul di sini.</p>
        </div>
      ) : (
        <MyActivityList registrations={registrations} />
      )}
    </div>
  );
}
