import { CheckIcon, CircleDashedIcon, XIcon } from "lucide-react";
import { cn } from "cn";

export type KeadaanLangkah = "selesai" | "menunggu" | "gagal";

/**
 * Satu langkah dalam senarai kemajuan keahlian.
 *
 * Keadaan disampaikan oleh ikon DAN teks, bukan warna sahaja - seorang
 * ahli yang tak dapat membezakan hijau daripada merah tetap perlu tahu
 * langkah mana yang gagal.
 */
export function StatusStep({
  keadaan,
  tajuk,
  perihal,
  akhir = false,
}: {
  keadaan: KeadaanLangkah;
  tajuk: string;
  perihal: React.ReactNode;
  akhir?: boolean;
}) {
  const Ikon = keadaan === "selesai" ? CheckIcon : keadaan === "gagal" ? XIcon : CircleDashedIcon;

  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!akhir ? (
        <span
          aria-hidden
          className="absolute top-7 bottom-0 left-[13px] w-px bg-border"
        />
      ) : null}

      <span
        className={cn(
          "relative z-[1] mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
          keadaan === "selesai" && "border-primary/25 bg-primary text-primary-foreground",
          keadaan === "menunggu" && "border-border bg-background text-muted-foreground",
          keadaan === "gagal" && "border-destructive/30 bg-destructive/10 text-destructive",
        )}
      >
        <Ikon className="size-3.5" aria-hidden />
        <span className="sr-only">
          {keadaan === "selesai" ? "Selesai" : keadaan === "gagal" ? "Gagal" : "Menunggu"}:
        </span>
      </span>

      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium">{tajuk}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">
          {perihal}
        </p>
      </div>
    </li>
  );
}
