import { Suspense } from "react";
import { MoonIcon } from "lucide-react";

import { SessionList } from "@/components/auth/session-list";
import { ThemeSwitch } from "@/components/marc/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsCard } from "@/components/settings/settings-card";
import { LogoutAllButton } from "@/components/settings/logout-all-button";
import { wajibSesi } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { accessToken } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Aplikasi</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Tetapan
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Kawal paparan dan keselamatan sesi akaun anda.
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

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SessionList accessToken={accessToken} />
      </Suspense>

      <SettingsCard label="Akaun">
        <LogoutAllButton />
      </SettingsCard>
    </div>
  );
}
