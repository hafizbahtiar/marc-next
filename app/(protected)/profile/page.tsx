import { Clock3Icon, CreditCardIcon, FileSearchIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { SettingNavItem } from "@/components/settings/setting-nav-item";
import { SettingsCard } from "@/components/settings/settings-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Akaun anda</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Profil
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Urus maklumat peribadi dan identiti keahlian anda.
        </p>
      </header>
      <ProfileHeader profile={profile} />
      <ProfileInfoCard profile={profile} />
      <SettingsCard label="Komuniti">
        <SettingNavItem
          icon={UsersIcon}
          label="Ahli"
          description="Lihat direktori ahli MARC"
          href="/members"
        />
        <SettingNavItem
          icon={MapPinIcon}
          label="Alamat saya"
          description="Urus alamat yang disimpan"
          href="/profile/addresses"
        />
      </SettingsCard>
      <SettingsCard label="Kewangan">
        <SettingNavItem
          icon={CreditCardIcon}
          label="Sejarah bayaran saya"
          description="Lihat yuran dan sokongan MARC"
          href="/payments/history"
        />
      </SettingsCard>
      {isManagement(profile) ? (
        <SettingsCard label="Pengurusan">
          <SettingNavItem
            icon={Clock3Icon}
            label="Ahli pending"
            description="Semak dan luluskan pendaftaran baharu"
            href="/members/pending"
          />
          <SettingNavItem
            icon={FileSearchIcon}
            label="Jejak audit"
            description="Lihat perubahan yang direkodkan"
            href="/audit-logs"
          />
        </SettingsCard>
      ) : null}
    </div>
  );
}
