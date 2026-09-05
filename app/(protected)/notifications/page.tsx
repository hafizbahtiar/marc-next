import { NotificationList } from "@/components/notifications/notification-list";
import { listNotifications } from "@/lib/notifications/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function NotificationsPage() {
  const { accessToken } = await wajibSesi("/notifications");
  const initial = await listNotifications(accessToken);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex items-end justify-between gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-primary">Pusat makluman</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Notifikasi
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Perkembangan akaun, aktiviti dan komuniti MARC anda.
          </p>
        </div>
      </header>
      <NotificationList initialPage={initial} />
    </div>
  );
}
