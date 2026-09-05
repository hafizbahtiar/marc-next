import Link from "next/link";

import { Logo } from "@/components/marc/logo";
import { MenuProfil } from "@/components/marc/menu-profil";
import { SuisTema } from "@/components/marc/suis-tema";
import type { Profile } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";

/**
 * Rangka bersama untuk setiap skrin selepas log masuk — termasuk skrin
 * gate (menunggu kelulusan, emel belum disahkan). Ahli yang tersekat
 * tetap ahli yang log masuk: menunjukkan kepadanya susun atur yang
 * berbeza sama sekali membuatnya kelihatan seperti dia berada di tempat
 * yang salah.
 */
export function RangkaAplikasi({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-5">
          {/*
            Jata sahaja, bukan logo penuh: pada 32px wordmark terbina
            dalam varian penuh menjadi comotan. Label teks di sebelahnya
            yang membawa nama itu.
          */}
          <Link href={ROUTES.utama} className="flex items-center gap-2.5">
            <Logo varian="jata" className="h-8" />
            <span className="text-base font-semibold tracking-[0.14em]">MARC</span>
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
            <Link href={ROUTES.pos} className="text-muted-foreground hover:text-foreground">
              Feed
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <SuisTema />
            <MenuProfil profile={profile} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
