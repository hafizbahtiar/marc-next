/**
 * Port TEPAT `phone.NormalizeMY` (internal/phone/phone.go). Sengaja
 * disalin dan bukan dianggarkan: sebarang perbezaan menghasilkan nombor
 * yang borang ini terima tetapi backend tolak (atau sebaliknya), dan
 * ahli nampak "format nombor telefon tidak sah" tanpa apa-apa petunjuk
 * medan mana yang salah. Fail Dart `shared/phone.dart` dalam marc_flutter
 * ialah salinan ketiga peraturan yang sama.
 *
 * Kalau peraturan backend berubah, ketiga-tiga salinan berubah bersama.
 */
const REGEX_MUDAH_ALIH_MY = /^(01[02-46-9]\d{7}|011\d{8})$/;
const REGEX_BERSIH = /[\s\-()]/g;

/** Pulangkan bentuk tempatan ternormal (`0XXXXXXXXX`), atau null. */
export function normalkanTelefonMY(raw: string): string | null {
  let s = raw.trim().replace(REGEX_BERSIH, "");

  if (s.startsWith("+60")) {
    s = "0" + s.slice(3);
  } else if (s.startsWith("60") && s.length >= 11) {
    s = "0" + s.slice(2);
  }

  return REGEX_MUDAH_ALIH_MY.test(s) ? s : null;
}
