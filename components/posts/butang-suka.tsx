"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HasilTindakan } from "@/lib/posts/hasil";

/**
 * Butang suka generik — dikongsi antara post dan comment. Ia tak tahu
 * yang mana satu; pemanggil hantar `suka`/`nyahSuka` (tindakan pelayan
 * yang betul untuk jenis entiti itu) sebagai prop.
 */
export function ButangSuka({
  id,
  kiraanAwal,
  disukaAwal,
  suka,
  nyahSuka,
}: {
  id: string;
  kiraanAwal: number;
  disukaAwal: boolean;
  suka: (id: string) => Promise<HasilTindakan>;
  nyahSuka: (id: string) => Promise<HasilTindakan>;
}) {
  const [disuka, setDisuka] = useState(disukaAwal);
  const [kiraan, setKiraan] = useState(kiraanAwal);
  const [pending, startTransition] = useTransition();

  function togol() {
    const disukaBaharu = !disuka;
    setDisuka(disukaBaharu);
    setKiraan((k) => k + (disukaBaharu ? 1 : -1));

    startTransition(async () => {
      try {
        const hasil = disukaBaharu ? await suka(id) : await nyahSuka(id);
        if (!hasil.ok) {
          // Undur balik keadaan optimistik — permintaan sebenar gagal.
          setDisuka(!disukaBaharu);
          setKiraan((k) => k - (disukaBaharu ? 1 : -1));
          toast.error(hasil.ralat);
        }
      } catch {
        // Belt-and-suspenders — tindakan sepatutnya tidak lagi lempar
        // (lihat `ralatDaripada` dalam lib/posts/actions.ts), tapi undur
        // keadaan optimistik di sini juga sekiranya ia berlaku.
        setDisuka(!disukaBaharu);
        setKiraan((k) => k - (disukaBaharu ? 1 : -1));
        toast.error("Sesuatu tidak kena. Cuba lagi.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={togol}
      aria-pressed={disuka}
    >
      <HeartIcon className={cn("size-4", disuka && "fill-primary text-primary")} />
      {kiraan}
    </Button>
  );
}
