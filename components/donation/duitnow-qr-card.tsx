"use client";

import Image from "next/image";
import { useState } from "react";
import { DownloadIcon, InfoIcon, QrCodeIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DuitNowQrCard() {
  const [downloading, setDownloading] = useState(false);

  async function downloadQr() {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch("/donation/maybank_hafiz.jpeg");
      if (!response.ok) throw new Error("qr-failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "MARC-DuitNow-QR.jpeg";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("QR berjaya dimuat turun.");
    } catch {
      toast.error("Gagal memuat turun QR. Cuba lagi.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCodeIcon className="size-5 text-primary" />
          DuitNow QR
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Imbas menggunakan mana-mana aplikasi bank atau e-wallet. Tiada yuran pemprosesan - sumbangan sampai penuh.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-white p-3 shadow-sm">
          <Image
            src="/donation/maybank_hafiz.jpeg"
            alt="DuitNow QR MARC"
            width={530}
            height={675}
            className="h-auto w-full"
            priority
          />
        </div>
        <Button type="button" variant="outline" className="w-full" disabled={downloading} onClick={() => void downloadQr()}>
          <DownloadIcon />
          {downloading ? "Memuat turun…" : "Muat turun QR"}
        </Button>
        <Alert>
          <InfoIcon />
          <AlertDescription>
            Sumbangan melalui QR tidak direkodkan dalam aplikasi, jadi tiada resit automatik. Jika perlukan resit, gunakan pembayaran kad apabila flow tersebut tersedia.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
