import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isManagement } from "@/lib/api/types";
import type { Profile } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";

export function HeaderProfil({ profile }: { profile: Profile }) {
  const nama = profile.display_name?.trim() || profile.email;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-accent text-base font-semibold text-accent-foreground">
            {inisial(nama)}
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

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.profilEdit}>
          <PencilIcon />
          Edit
        </Link>
      </Button>
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
