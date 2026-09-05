import { Suspense } from "react";
import {
  BookOpenIcon,
  CircleHelpIcon,
  InfoIcon,
  MoonIcon,
  SendIcon,
} from "lucide-react";

import { SessionList } from "@/components/auth/session-list";
import { ThemeSwitch } from "@/components/marc/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsCard } from "@/components/settings/settings-card";
import { LogoutAllButton } from "@/components/settings/logout-all-button";
import { SettingNavItem } from "@/components/settings/setting-nav-item";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { wajibSesi } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { accessToken, profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Aplikasi</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Tetapan
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Kawal paparan, sambungan, dan keselamatan akaun anda.
        </p>
      </header>

      <SettingsCard label="Paparan">
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <MoonIcon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Mod gelap</p>
              <p className="text-xs text-muted-foreground">Laraskan penampilan aplikasi.</p>
            </div>
          </div>
          <ThemeSwitch />
        </div>
      </SettingsCard>

      <SettingsCard label="Sambungan">
        <SettingNavItem
          icon={SendIcon}
          label="Telegram"
          description={profile.telegram_linked ? "Akaun Telegram disambungkan" : "Sambungkan akaun Telegram"}
          href="/settings/telegram"
        />
      </SettingsCard>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SettingsCard label="Akaun">
          <SettingNavItem
            icon={BookOpenIcon}
            label="Sesi aktif"
            description="Urus peranti yang sedang log masuk"
            href="/settings/sessions"
          />
          <LogoutAllButton />
        </SettingsCard>
      </Suspense>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SessionList accessToken={accessToken} />
      </Suspense>

      <SettingsCard label="Bantuan">
        <SettingNavItem icon={CircleHelpIcon} label="Soalan lazim" href="/settings/faq" />
        <SettingNavItem icon={InfoIcon} label="Tentang" href="/settings/about" />
      </SettingsCard>

      <SettingsCard label="Zon bahaya">
        <DeleteAccountButton />
      </SettingsCard>
    </div>
  );
}
