"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, HouseIcon, NewspaperIcon, SettingsIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/auth/routes";

const items = [
  { href: ROUTES.utama, label: "Utama", icon: HouseIcon },
  { href: ROUTES.pos, label: "Feed", icon: NewspaperIcon },
  { href: ROUTES.notifikasi, label: "Notifikasi", icon: BellIcon },
  { href: ROUTES.profil, label: "Profil", icon: UserIcon },
  { href: ROUTES.tetapan, label: "Tetapan", icon: SettingsIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== ROUTES.utama && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition-colors",
                active && "text-primary",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("grid size-8 place-items-center rounded-full", active && "bg-primary/10")}>
                <Icon className="size-[18px]" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
