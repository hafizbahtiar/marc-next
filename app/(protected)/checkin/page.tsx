import { QrCodeIcon } from "lucide-react";

import { QrScanner } from "@/components/activities/qr-scanner";
import { wajibSesi } from "@/lib/auth/session";

export default async function SelfCheckinPage() {
  await wajibSesi();

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <header className="grid gap-2 text-center">
        <p className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><QrCodeIcon /></p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Daftar hadir sendiri</h1>
        <p className="text-sm leading-6 text-muted-foreground">Imbas QR yang dipaparkan oleh pengurusan di venue.</p>
      </header>
      <QrScanner mode="self" />
    </div>
  );
}
