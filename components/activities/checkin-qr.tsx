"use client";

import { useState } from "react";
import { QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";

export function CheckinQr({ token, label = "Papar QR check-in" }: { token: string; label?: string }) {
  const [open, setOpen] = useState(false);
  if (!token) return null;

  return (
    <div className="grid gap-3">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        <QrCodeIcon />
        {open ? "Sembunyikan QR" : label}
      </Button>
      {open ? (
        <div className="grid justify-items-center gap-3 rounded-xl bg-white p-4 text-center">
          <QRCodeSVG value={token} size={220} level="M" includeMargin aria-label="QR check-in peribadi" />
          <p className="max-w-xs text-xs text-slate-600">Tunjukkan QR ini kepada pengurusan untuk direkodkan kehadiran anda.</p>
        </div>
      ) : null}
    </div>
  );
}

export function VenueCheckinQr({ activityId, sessionId }: { activityId: string; sessionId: string }) {
  const value = `marc-checkin:${activityId}:${sessionId}`;
  return (
    <div className="grid justify-items-center gap-4 rounded-2xl bg-white p-6 text-center">
      <QRCodeSVG value={value} size={280} level="M" includeMargin aria-label="QR daftar hadir sesi" />
      <p className="max-w-sm text-sm text-slate-700">
        Paparkan QR ini di venue. Ahli akan scan menggunakan fungsi daftar hadir sendiri.
      </p>
    </div>
  );
}
