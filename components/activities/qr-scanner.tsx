"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { scanAttendanceByTokenAction, selfCheckInAction } from "@/lib/activities/actions";

type ScannerMode = "self" | "management";

export function QrScanner({
  mode,
  activityId,
  sessionId,
}: {
  mode: ScannerMode;
  activityId?: string;
  sessionId?: string;
}) {
  const rawId = useId();
  const elementId = `qr-reader-${rawId.replace(/:/g, "")}`;
  const [manualValue, setManualValue] = useState("");
  const [message, setMessage] = useState("Halakan kamera ke kod QR.");
  const [messageKind, setMessageKind] = useState<"default" | "error" | "success">("default");
  const [pending, startTransition] = useTransition();
  const busyRef = useRef(false);

  function handleCode(value: string) {
    if (busyRef.current || !value.trim()) return;
    busyRef.current = true;
    startTransition(async () => {
      const result = mode === "self"
        ? await handleSelfCode(value)
        : await handleManagementCode(value);
      if (!result) {
        busyRef.current = false;
        return;
      }
      if (!result.ok) {
        setMessage(result.error);
        setMessageKind("error");
        toast.error(result.error);
      } else {
        setMessage(mode === "self" ? "Kehadiran berjaya direkodkan." : "Kehadiran ahli berjaya direkodkan.");
        setMessageKind("success");
        toast.success("Kehadiran berjaya direkodkan.");
      }
      window.setTimeout(() => { busyRef.current = false; }, 1800);
    });
  }

  function submitManual() {
    handleCode(manualValue);
    setManualValue("");
  }

  async function handleSelfCode(value: string) {
    const prefix = "marc-checkin:";
    if (!value.startsWith(prefix)) return { ok: false as const, error: "Ini bukan QR daftar hadir venue." };
    const [scannedActivityId, scannedSessionId] = value.slice(prefix.length).split(":");
    if (!scannedActivityId || !scannedSessionId) return { ok: false as const, error: "QR venue tidak sah." };
    return selfCheckInAction(scannedActivityId, scannedSessionId);
  }

  async function handleManagementCode(value: string) {
    if (!activityId || !sessionId) return { ok: false as const, error: "Sesi scanner tidak lengkap." };
    return scanAttendanceByTokenAction(activityId, sessionId, value.trim());
  }

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(elementId, { fps: 10, qrbox: { width: 240, height: 240 } }, false);
    scanner.render((decodedText) => handleCode(decodedText), () => undefined);
    return () => {
      void scanner.clear().catch(() => undefined);
    };
    // The scanner must be created once for this mounted camera container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId]);

  return (
    <div className="grid gap-4">
      <div id={elementId} className="overflow-hidden rounded-2xl border bg-card p-3" />
      <Alert variant={messageKind === "error" ? "destructive" : "default"} role="status">
        <AlertTitle>{pending ? "Mengesahkan kehadiran…" : messageKind === "success" ? "Kehadiran direkodkan" : "Status scanner"}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="grid gap-2 border-t pt-4">
        <p className="text-sm font-medium">Atau masukkan token secara manual</p>
        <div className="flex gap-2">
          <Input value={manualValue} onChange={(event) => setManualValue(event.target.value)} placeholder="Token QR" />
          <Button type="button" onClick={submitManual} disabled={pending || !manualValue.trim()}>Hantar</Button>
        </div>
      </div>
    </div>
  );
}
