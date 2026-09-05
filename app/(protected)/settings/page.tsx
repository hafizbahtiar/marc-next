import { Suspense } from "react";
import { MoonIcon } from "lucide-react";

import { SenaraiSesi } from "@/components/auth/senarai-sesi";
import { SuisTema } from "@/components/marc/suis-tema";
import { Skeleton } from "@/components/ui/skeleton";
import { KadTetapan } from "@/components/tetapan/kad-tetapan";
import { ButangLogKeluarSemua } from "@/components/tetapan/butang-log-keluar-semua";
import { wajibSesi } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { accessToken } = await wajibSesi();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Tetapan
        </h1>
      </header>

      <KadTetapan label="Paparan">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-sm">
            <MoonIcon className="size-4" />
            Mod gelap
          </span>
          <SuisTema />
        </div>
      </KadTetapan>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SenaraiSesi accessToken={accessToken} />
      </Suspense>

      <KadTetapan label="Akaun">
        <ButangLogKeluarSemua />
      </KadTetapan>
    </div>
  );
}
