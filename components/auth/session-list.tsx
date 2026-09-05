import { MonitorIcon } from "lucide-react";

import { RevokeSessionButton } from "@/components/auth/revoke-session-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { senaraiSesi } from "@/lib/auth/api";
import type { SessionRecord } from "@/lib/api/types";

/**
 * Peranti yang sedang log masuk. Satu baris = satu family refresh token,
 * bukan satu token - backend sudah mengumpulkannya (lihat
 * groupSessionsByFamily, internal/http/handlers/sessions.go), jadi
 * putaran token tak menampakkan satu peranti sebagai banyak.
 */
export async function SessionList({ accessToken }: { accessToken: string }) {
  const sesi = await senaraiSesi(accessToken);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peranti yang log masuk</CardTitle>
        <CardDescription>
          Log keluar mana-mana peranti yang anda tak kenali.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {sesi.map((s) => (
          <SessionRow key={s.id} sesi={s} />
        ))}
      </CardContent>
    </Card>
  );
}

function SessionRow({ sesi }: { sesi: SessionRecord }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-3 last:border-0 last:pb-0 first:pt-0">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground"
      >
        <MonitorIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{sesi.user_agent ?? "Peranti tidak dikenali"}</span>
          {sesi.is_current ? (
            <Badge variant="secondary" className="shrink-0 text-primary">
              Peranti ini
            </Badge>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          Log masuk {formatShortDate(sesi.created_at)}
          {sesi.created_ip ? ` · ${sesi.created_ip}` : ""}
        </p>
      </div>

      {/*
        Peranti semasa tak boleh dilog keluar dari sini. Membatalkan
        familynya sendiri akan menendang ahli keluar melalui laluan yang
        kelihatan seperti pepijat - butang "Log keluar" di bar atas ialah
        cara yang jelas untuk berbuat demikian.
      */}
      {sesi.is_current ? null : <RevokeSessionButton id={sesi.id} />}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(d);
}
