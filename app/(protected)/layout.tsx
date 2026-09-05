import { redirect } from "next/navigation";

import { AppShell } from "@/components/marc/app-shell";
import { ROUTES } from "@/lib/auth/routes";
import { dapatkanSesi, skrinGate } from "@/lib/auth/session";
import { listNotifications } from "@/lib/notifications/api";
import type { AppNotification } from "@/lib/notifications/api";

/**
 * Gate sebenar untuk kawasan aplikasi.
 *
 * `proxy.ts` hanya menyemak KEWUJUDAN kuki; ia tak tahu apa-apa tentang
 * status kelulusan atau pengesahan emel. Semakan itu berlaku di sini,
 * di mana GET /me sudah pun diperlukan untuk merender bar atas - jadi ia
 * tak menambah satu pun permintaan tambahan.
 *
 * Ini tetap bukan sempadan keselamatan. Setiap titik akhir yang dipanggil
 * halaman ini dilindungi oleh `RequireApprovedStatus` dan
 * `RequireVerifiedEmail` di backend; susun atur ini hanya memastikan ahli
 * melihat penjelasan dan bukan 403.
 */
export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect(ROUTES.tamatSesi);

  const gate = skrinGate(sesi.profile);
  if (gate) redirect(gate);

  let unreadNotificationCount = 0;
  let notificationPreview: AppNotification[] | undefined;
  try {
    const notifications = await listNotifications(sesi.accessToken);
    notificationPreview = notifications.notifications;
    unreadNotificationCount = notifications.notifications.filter((item) => !item.read).length;
  } catch {
    // Kegagalan badge tidak patut menghalang halaman utama daripada dirender.
  }

  return (
    <AppShell
      profile={sesi.profile}
      unreadNotificationCount={unreadNotificationCount}
      notificationPreview={notificationPreview}
    >
      {children}
    </AppShell>
  );
}
