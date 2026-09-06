import { Suspense } from "react";
import {
  BookOpenIcon,
  Building2Icon,
  CreditCardIcon,
  AwardIcon,
  FileUpIcon,
  Layers3Icon,
  MailWarningIcon,
  ShieldBanIcon,
  UserRoundXIcon,
} from "lucide-react";

import { SessionList } from "@/components/auth/session-list";
import { TelegramPanel } from "@/components/settings/telegram-panel";
import { ResponsiveSheetItem, SettingsAboutSheetContent, SettingsFaqSheetContent } from "@/components/marc/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsSectionNav } from "@/components/settings/settings-section-nav";
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
        <SettingsSectionNav
          items={[
            { id: "connections", label: "Sambungan" },
            { id: "account", label: "Akaun" },
            ...(profile.role_key === "admin" || profile.role_key === "superadmin"
              ? [{ id: "activity", label: "Aktiviti" }]
              : []),
            ...(profile.role_key === "superadmin" ? [{ id: "system", label: "Sistem" }] : []),
            { id: "help", label: "Bantuan" },
            { id: "danger", label: "Zon bahaya" },
          ]}
        />

        <div className="grid min-w-0 gap-8">
          <SettingsCard id="connections" label="Sambungan">
            <ResponsiveSheetItem
              icon="send"
              label="Telegram"
              description={profile.telegram_linked ? "Akaun Telegram disambungkan" : "Sambungkan akaun Telegram"}
            >
              <TelegramPanel linked={profile.telegram_linked} username={profile.telegram_username} />
            </ResponsiveSheetItem>
          </SettingsCard>

          {["admin", "superadmin"].includes(profile.role_key) ? (
            <SettingsCard id="activity" label="Aktiviti">
              <SettingNavItem
                icon={Layers3Icon}
                label="Urus kategori"
                description="Kategori yang digunakan untuk aktiviti"
                href="/settings/activity-categories"
              />
              <SettingNavItem
                icon={CreditCardIcon}
                label="Log bayaran"
                description="Pantau bayaran dan reconcile gateway"
                href="/admin/payments"
              />
              <SettingNavItem
                icon={AwardIcon}
                label="Template sijil"
                description="Urus reka bentuk global sijil aktiviti"
                href="/settings/certificate-templates"
              />
              {profile.role_key === "superadmin" ? (
                <SettingNavItem
                  icon={FileUpIcon}
                  label="Import ahli lama"
                  description="Semak dan padankan data ahli MARC lama"
                  href="/settings/legacy-import"
                />
              ) : null}
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
              <SettingNavItem
                icon={UserRoundXIcon}
                label="Pemadaman akaun"
                description="Semak dan proses permintaan pemadaman data"
                href="/settings/account-deletions"
              />
              <SettingNavItem
                icon={ShieldBanIcon}
                label="Akaun digantung"
                description="Urus ban sementara dan permanent"
                href="/settings/banned-members"
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
            <ResponsiveSheetItem icon="help" label="Soalan lazim" description="Jawapan untuk perkara biasa">
              <SettingsFaqSheetContent />
            </ResponsiveSheetItem>
            <ResponsiveSheetItem icon="info" label="Tentang" description="Maklumat ringkas tentang MARC">
              <SettingsAboutSheetContent />
            </ResponsiveSheetItem>
          </SettingsCard>

          <SettingsCard id="danger" label="Zon bahaya">
            <DeleteAccountButton />
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
