"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KUNCI_TEMA, temaSemasa, type Tema } from "@/lib/tema";

const TEMPOH_MS = 450;
/** `Curves.easeInOutCubic` Flutter, dalam bentuk CSS. */
const LENGKUNG = "cubic-bezier(0.645, 0.045, 0.355, 1)";

/**
 * Suis tema dengan pendedahan bulat dari titik klik - padanan
 * `ThemeSwitchReveal` (marc_flutter/lib/core/theme_switch_reveal.dart),
 * yang meniru peralihan tema Telegram.
 *
 * Flutter melakukannya dengan menangkap snapshot tema LAMA dan memotong
 * lubang yang membesar padanya. Web mempunyai primitif yang lebih baik:
 * View Transitions API mengambil snapshot itu sendiri, jadi yang tinggal
 * hanyalah menganimasikan `clip-path` pada lapisan BAHARU. Kesan visual
 * yang sama, tanpa kod snapshot.
 *
 * Ia merosot dengan bersih: pelayar tanpa `startViewTransition`
 * (Firefox, pada masa penulisan) menukar tema serta-merta, begitu juga
 * pengguna yang meminta kurang gerakan.
 */
export function ThemeSwitch() {
  // TIADA keadaan React di sini dengan sengaja. Tema sebenar hidup dalam
  // kelas `<html>`, ditetapkan oleh skrip sebaris sebelum React berjalan
  // (lihat InitialThemeScript), jadi pelayan tak boleh mengetahuinya -
  // menyalinnya ke dalam keadaan komponen hanya mencipta salinan kedua
  // yang boleh menyimpang, dan menjamin ketidakpadanan hidrasi pada
  // bingkai pertama. Ikon ditukar oleh CSS; pengendali membaca DOM.
  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    const baharu: Tema = temaSemasa() === "dark" ? "light" : "dark";

    const guna = () => {
      document.documentElement.classList.toggle("dark", baharu === "dark");
      try {
        localStorage.setItem(KUNCI_TEMA, baharu);
      } catch {
        // Mod peribadi, atau storan tapak disekat. Tema tetap bertukar
        // untuk sesi ini; ia cuma tak diingati.
      }
    };

    const kurangGerakan = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (kurangGerakan || !document.startViewTransition) {
      guna();
      return;
    }

    // Bulatan bermula pada butang dan mesti membesar sehingga mencapai
    // penjuru skrin yang PALING JAUH - kalau tidak, satu bucu kekal
    // dalam tema lama apabila animasi tamat.
    const { top, left, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const jejari = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const peralihan = document.startViewTransition(guna);
    peralihan.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${jejari}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: TEMPOH_MS,
          easing: LENGKUNG,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      // Label statik: ia mesti sama pada pelayan dan klien, dan pelayan
      // tak tahu tema pelawat. "Tukar tema" menerangkan apa yang butang
      // BUAT, yang betul dalam kedua-dua arah.
      aria-label="Tukar tema cerah atau gelap"
      title="Tukar tema"
    >
      {/*
        Kedua-dua ikon sentiasa dirender dan ditukar dengan CSS varian
        `dark:`. Merendernya secara bersyarat daripada keadaan React akan
        menunjukkan ikon yang salah pada bingkai pertama, kerana pelayan
        tak tahu tema pelawat.
      */}
      <SunIcon className="dark:hidden" aria-hidden />
      <MoonIcon className="hidden dark:block" aria-hidden />
    </Button>
  );
}
