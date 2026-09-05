import { Suspense } from "react";
import {
  BookOpenIcon,
  Building2Icon,
  CircleHelpIcon,
  InfoIcon,
  Layers3Icon,
  MailWarningIcon,
  MoonIcon,
  SendIcon,
} from "lucide-react";

import { SessionList } from "@/components/auth/session-list";
import { ThemeSwitch } from "@/components/marc/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsCard } from "@/components/settings/settings-card";
import { LogoutAllButton } from "@/components/settings/logout-all-button";
import { LogoutButton } from "@/components/settings/logout-button";
import { SettingNavItem } from "@/components/settings/setting-nav-item";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { wajibSesi } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { accessToken, profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-6xl gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Account workspace</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Tetapan
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Kawal paparan, sambungan, dan keselamatan akaun anda.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 pb-1 lg:sticky lg:top-24 lg:grid lg:overflow-visible" aria-label="Bahagian tetapan">
          {[
            ["#appearance", "Paparan"],
            ["#connections", "Sambungan"],
            ["#account", "Akaun"],
            ...(profile.role_key === "admin" || profile.role_key === "superadmin" ? [["#activity", "Aktiviti"]] : []),
            ...(profile.role_key === "superadmin" ? [["#system", "Sistem"]] : []),
            ["#help", "Bantuan"],
            ["#danger", "Zon bahaya"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="grid min-w-0 gap-8">
          <SettingsCard id="appearance" label="Paparan">
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

          <SettingsCard id="connections" label="Sambungan">
            <SettingNavItem
              icon={SendIcon}
              label="Telegram"
              description={profile.telegram_linked ? "Akaun Telegram disambungkan" : "Sambungkan akaun Telegram"}
              href="/settings/telegram"
            />
          </SettingsCard>

          {["admin", "superadmin"].includes(profile.role_key) ? (
            <SettingsCard id="activity" label="Aktiviti">
              <SettingNavItem
                icon={Layers3Icon}
                label="Urus kategori"
                description="Kategori yang digunakan untuk aktiviti"
                href="/settings/activity-categories"
              />
            </SettingsCard>
          ) : null}

          {profile.role_key === "superadmin" ? (
            <SettingsCard id="system" label="Sistem">
              <SettingNavItem
                icon={MailWarningIcon}
                label="Domain emel disekat"
                description="Urus domain yang tidak dibenarkan"
                href="/settings/blocked-email-domains"
              />
              <SettingNavItem
                icon={Building2Icon}
                label="Bahagian/jabatan"
                description="Urus struktur organisasi"
                href="/settings/departments"
              />
            </SettingsCard>
          ) : null}

          <SettingsCard id="account" label="Akaun">
              <SettingNavItem
                icon={BookOpenIcon}
                label="Sesi aktif"
                description="Urus peranti yang sedang log masuk"
                href="/settings/sessions"
              />
              <LogoutAllButton />
              <LogoutButton />
          </SettingsCard>

          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <SessionList accessToken={accessToken} />
          </Suspense>

          <SettingsCard id="help" label="Bantuan">
            <SettingNavItem icon={CircleHelpIcon} label="Soalan lazim" href="/settings/faq" />
            <SettingNavItem icon={InfoIcon} label="Tentang" href="/settings/about" />
          </SettingsCard>

          <SettingsCard id="danger" label="Zon bahaya">
            <DeleteAccountButton />
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
