import Link from "next/link";
import { PencilIcon, SettingsIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isManagement } from "@/lib/api/types";
import type { Profile } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";

export function ProfileHeader({ profile }: { profile: Profile }) {
  const nama = profile.display_name?.trim() || profile.email;

  return (
    <div className="flex flex-col justify-between gap-5 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 ring-4 ring-secondary">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-accent text-base font-semibold text-accent-foreground">
            {getInitials(nama)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="flex items-center gap-2 font-heading text-lg font-semibold">
            {nama}
            {isManagement(profile) ? (
              <Badge variant="secondary" className="text-primary">
                Pengurusan
              </Badge>
            ) : null}
          </p>
          <p className="text-sm text-muted-foreground">{profile.role_name}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.profilEdit}>
            <PencilIcon />
            Edit
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Tetapan">
          <Link href={ROUTES.tetapan}>
            <SettingsIcon />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Dua huruf pertama, atau satu bila hanya ada satu perkataan. */
function getInitials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
