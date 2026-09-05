"use client";

import { useState, useTransition } from "react";
import { AwardIcon, CheckCircle2Icon, Clock3Icon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/lib/activities/api";
import { issueCertificatesAction } from "@/lib/activities/actions";
import { formatActivityDateTime } from "@/lib/activities/helpers";

export function CertificateIssuer({ activity }: { activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ issued: number; files_ready: number; message: string } | null>(null);
  const finished = new Date(activity.ends_at) < new Date();
  const minimumSessions = activity.sessions.length
    ? Math.ceil(activity.sessions.length * activity.attendance_threshold_pct / 100)
    : 0;

  function issue() {
    startTransition(async () => {
      const response = await issueCertificatesAction(activity.id);
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setResult(response.data);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-3">
        <Stat label="Peserta berdaftar" value={String(activity.registration_count)} />
        <Stat label="Jumlah sesi" value={String(activity.sessions.length)} />
        <Stat label="Minimum hadir" value={activity.sessions.length ? `${minimumSessions}/${activity.sessions.length}` : "-"} />
      </div>

      {!finished ? (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <Clock3Icon className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <AlertTitle>Belum boleh diterbitkan</AlertTitle>
          <AlertDescription>Sijil hanya boleh diterbitkan selepas sesi terakhir tamat pada {formatActivityDateTime(activity.ends_at)}.</AlertDescription>
        </Alert>
      ) : null}

      {activity.certificates_issued_at ? (
        <p className="text-sm text-muted-foreground">
          Sijil pernah diterbitkan. Tekan “Terbitkan / sambung” untuk menambah peserta baharu yang layak atau melengkapkan fail yang belum siap.
        </p>
      ) : null}

      <ConfirmationDialog
        title="Terbitkan sijil?"
        description={`Sijil akan diterbitkan untuk peserta yang mencapai ambang ${activity.attendance_threshold_pct}% kehadiran. Sijil sedia ada tidak akan diduplikasi.`}
        confirmLabel="Terbitkan"
        trigger={
          <Button type="button" disabled={!finished || pending || activity.status === "cancelled"}>
            <AwardIcon />
            {pending ? "Menerbitkan…" : activity.certificates_issued_at ? "Terbitkan / sambung" : "Terbitkan sijil"}
          </Button>
        }
        onConfirm={async () => {
          issue();
          return true;
        }}
      />

      {result ? (
        <Alert className="border-success/30 bg-success-bg">
          <CheckCircle2Icon className="size-5 text-success" />
          <AlertTitle>{result.message}</AlertTitle>
          <AlertDescription>
            {result.issued} sijil baharu diproses. {result.files_ready} fail sijil sudah sedia dimuat turun.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1"><span className="text-sm text-muted-foreground">{label}</span><strong className="font-heading text-2xl">{value}</strong></div>;
}
