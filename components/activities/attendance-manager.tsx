"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { VenueCheckinQr } from "@/components/activities/checkin-qr";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActivityRegistrant, ActivitySession } from "@/lib/activities/api";
import { markAttendanceAction, unmarkAttendanceAction } from "@/lib/activities/actions";

export function AttendanceManager({
  activityId,
  sessions,
  registrants,
}: {
  activityId: string;
  sessions: ActivitySession[];
  registrants: ActivityRegistrant[];
}) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [showVenueQr, setShowVenueQr] = useState(false);
  const [marked, setMarked] = useState(() => new Set(registrants.flatMap((person) => person.attended_session_ids.map((id) => `${person.id}:${id}`))));
  const [pending, startTransition] = useTransition();
  const selectedSession = sessions.find((session) => session.id === sessionId);
  const visible = registrants.filter((person) => `${person.display_name} ${person.member_id}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => `${a.display_name}${a.member_id}`.localeCompare(`${b.display_name}${b.member_id}`));

  function toggle(person: ActivityRegistrant, value: boolean) {
    const key = `${person.id}:${sessionId}`;
    const previous = marked.has(key);
    setMarked((current) => {
      const next = new Set(current);
      if (value) next.add(key); else next.delete(key);
      return next;
    });
    startTransition(async () => {
      let result = value
        ? await markAttendanceAction(activityId, sessionId, person.id)
        : await unmarkAttendanceAction(activityId, sessionId, person.id);
      if (!result.ok && value && result.code === "outside_window") {
        const reason = window.prompt("Kehadiran di luar tetingkap check-in. Masukkan sebab pindaan:");
        if (reason?.trim()) {
          result = await markAttendanceAction(activityId, sessionId, person.id, reason.trim());
        }
      }
      if (!result.ok) {
        setMarked((current) => {
          const next = new Set(current);
          if (previous) next.add(key); else next.delete(key);
          return next;
        });
        toast.error(result.error);
        return;
      }
      toast.success(value ? `${displayName(person)} ditanda hadir.` : `Kehadiran ${displayName(person)} dibuang.`);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="sm:max-w-sm"><SelectValue placeholder="Pilih sesi" /></SelectTrigger>
          <SelectContent>{sessions.map((session) => <SelectItem key={session.id} value={session.id}>{session.title || `Sesi ${session.seq}`}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={() => setShowVenueQr((value) => !value)} disabled={!sessionId}>
          {showVenueQr ? "Sembunyikan QR venue" : "Papar QR venue"}
        </Button>
        <div className="relative flex-1">
          <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari peserta" className="pl-9" />
        </div>
      </div>
      {selectedSession ? <p className="text-sm text-muted-foreground">Kehadiran untuk {selectedSession.title || `Sesi ${selectedSession.seq}`}</p> : null}
      {sessionId ? <Button asChild variant="outline" size="sm" className="w-fit"><Link href={`/activities/${encodeURIComponent(activityId)}/sessions/${encodeURIComponent(sessionId)}/scan`}>Imbas QR ahli</Link></Button> : null}
      {showVenueQr && sessionId ? <VenueCheckinQr activityId={activityId} sessionId={sessionId} /> : null}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">Tiada peserta ditemui.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          {visible.map((person) => {
            const isMarked = marked.has(`${person.id}:${sessionId}`);
            return (
              <div key={person.id} className="flex items-center justify-between gap-3 border-b p-4 last:border-0">
                <div className="min-w-0">
                  <p className="truncate font-medium">{displayName(person)}</p>
                  <p className="text-xs text-muted-foreground">{person.member_id || "No. ahli tidak tersedia"}</p>
                </div>
                {isMarked ? (
                  <ConfirmationDialog
                    title="Buang kehadiran?"
                    description="Kehadiran ini mempengaruhi kelayakan sijil peserta dan tindakan ini akan direkodkan."
                    confirmLabel="Buang kehadiran"
                    trigger={
                      <Button type="button" size="sm" variant="secondary" disabled={pending || !sessionId}>
                        <CheckCircle2Icon className="fill-current" />
                        Hadir
                      </Button>
                    }
                    onConfirm={async () => {
                      toggle(person, false);
                      return true;
                    }}
                  />
                ) : (
                  <Button type="button" size="sm" variant="outline" disabled={pending || !sessionId} onClick={() => toggle(person, true)}>
                    <CheckCircle2Icon />
                    Tanda hadir
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function displayName(person: ActivityRegistrant): string {
  return person.display_name.trim() || person.member_id || "Ahli MARC";
}
