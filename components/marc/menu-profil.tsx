"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logKeluarAction } from "@/lib/auth/actions";
import { ROUTES } from "@/lib/auth/routes";
import type { Profile } from "@/lib/api/types";

/**
 * Menu profil di bar atas — pemicu avatar membuka satu dropdown yang
 * membawa identiti, pautan Profil/Tetapan, dan log keluar. Menggantikan
 * kelompok avatar + nama + log keluar yang sebelum ini terapung berasingan
 * di bar atas dengan satu titik masuk yang jelas.
 */
export function MenuProfil({ profile }: { profile: Profile }) {
  const nama = profile.display_name?.trim() || profile.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Avatar className="size-8">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
            {inisial(nama)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid gap-0.5 py-1.5">
          <span className="truncate text-sm font-medium text-foreground">{nama}</span>
          <span className="truncate text-xs text-muted-foreground">{profile.role_name}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={ROUTES.profil}>
            <UserIcon />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.tetapan}>
            <SettingsIcon />
            Tetapan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild variant="destructive">
          <form action={logKeluarAction} className="w-full">
            <ButangKeluar />
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Butang sebenar dalam borang log keluar — berasingan daripada
 * `MenuProfil` supaya `useFormStatus` (yang cuma berfungsi dalam anak
 * `<form>`) boleh membaca status borang induknya.
 */
function ButangKeluar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex w-full items-center gap-1.5">
      <LogOutIcon />
      {pending ? "Melog keluar…" : "Log keluar"}
    </button>
  );
}

/** Dua huruf pertama, atau satu bila hanya ada satu perkataan. */
function inisial(nama: string): string {
  const bahagian = nama.split(/[\s@.]+/).filter(Boolean);
  if (bahagian.length === 0) return "?";
  if (bahagian.length === 1) return bahagian[0].slice(0, 2).toUpperCase();
  return (bahagian[0][0] + bahagian[1][0]).toUpperCase();
}
