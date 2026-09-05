import Link from "next/link";

import { Logo } from "@/components/marc/logo";
import { MobileNav } from "@/components/marc/mobile-nav";
import { NotificationPreview } from "@/components/notifications/notification-preview";
import { ProfileMenu } from "@/components/marc/profile-menu";
import { ThemeSwitch } from "@/components/marc/theme-switch";
import type { Profile } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";
import type { AppNotification } from "@/lib/notifications/api";

/**
 * Rangka bersama untuk setiap skrin selepas log masuk - termasuk skrin
 * gate (menunggu kelulusan, emel belum disahkan). Ahli yang tersekat
 * tetap ahli yang log masuk: menunjukkan kepadanya susun atur yang
 * berbeza sama sekali membuatnya kelihatan seperti dia berada di tempat
 * yang salah.
 */
export function AppShell({
  profile,
  unreadNotificationCount,
  notificationPreview,
  children,
}: {
  profile: Profile;
  unreadNotificationCount?: number;
  notificationPreview?: AppNotification[];
  children: React.ReactNode;
}) {
  const unreadCount = unreadNotificationCount ?? 0;
  return (
    <div className="flex min-h-svh flex-col bg-muted/25">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          {/*
            Jata sahaja, bukan logo penuh: pada 32px wordmark terbina
            dalam varian penuh menjadi comotan. Label teks di sebelahnya
            yang membawa nama itu.
          */}
          <Link href={ROUTES.utama} className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo varian="jata" className="h-8" />
            <span className="text-sm font-semibold tracking-[0.18em]">MARC</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg bg-muted/60 p-1 text-sm font-medium md:flex">
            <Link href={ROUTES.utama} className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              Utama
            </Link>
            <Link href={ROUTES.pos} className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              Feed
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <NotificationPreview items={notificationPreview} unreadCount={unreadCount} />
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>
            <ProfileMenu profile={profile} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 md:pb-10">{children}</main>
      <MobileNav />
    </div>
  );
}
