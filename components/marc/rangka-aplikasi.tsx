import Link from "next/link";

import { ButangLogKeluar } from "@/components/auth/butang-log-keluar";
import { Logo } from "@/components/marc/logo";
import { SuisTema } from "@/components/marc/suis-tema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const nama = profile.display_name?.trim() || profile.email;

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

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href={ROUTES.pos} className="text-muted-foreground hover:text-foreground">
              Feed
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-[13px] font-medium">{nama}</p>
              <p className="text-[11px] text-muted-foreground">{profile.role_name}</p>
            </div>
            <Avatar className="size-8">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                {inisial(nama)}
              </AvatarFallback>
            </Avatar>
            <SuisTema />
            <ButangLogKeluar />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}

/** Dua huruf pertama, atau satu bila hanya ada satu perkataan. */
function inisial(nama: string): string {
  const bahagian = nama.split(/[\s@.]+/).filter(Boolean);
  if (bahagian.length === 0) return "?";
  if (bahagian.length === 1) return bahagian[0].slice(0, 2).toUpperCase();
  return (bahagian[0][0] + bahagian[1][0]).toUpperCase();
}
