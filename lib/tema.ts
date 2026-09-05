/**
 * Kunci `localStorage` untuk pilihan tema.
 *
 * `theme_mode` dipilih supaya ia SEPADAN dengan kunci SharedPreferences
 * dalam marc_flutter (`_prefsKey`, lib/core/theme_mode_provider.dart).
 * Kedua-dua klien tak berkongsi storan, jadi ia tak menjimatkan apa-apa
 * secara teknikal — ia menjadikan pilihan itu boleh dicari merentas
 * kedua-dua repo dengan satu grep.
 */
export const KUNCI_TEMA = "theme_mode";

export type Tema = "light" | "dark";

export function temaSemasa(): Tema {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
