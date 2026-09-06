/**
 * Ringkasan konflik untuk dihantar kepada client.
 *
 * Dikumpulkan mengikut MESEJ, bukan `code`. Mesej itulah yang membawa
 * nilai spesifik - "Kod bahagian tidak wujud: PEJ. SUM/KPE." lawan
 * "...: UU." Mengumpul ikut `code` akan meruntuhkan kesemuanya jadi satu
 * baris "unknown_department", dan itu tepat maklumat yang client
 * perlukan untuk bertindak.
 *
 * Logik ini sengaja diasingkan daripada komponen supaya boleh diuji
 * tanpa DOM (repo ini tiada testing-library).
 */
export type RingkasanKonflik = { message: string; count: number };

type BarisBerkonflik = { conflicts: { code: string; message: string }[] };

export function ringkasanKonflik(rows: BarisBerkonflik[]): RingkasanKonflik[] {
  const kiraan = new Map<string, number>();

  for (const row of rows) {
    // Set: satu baris yang membawa mesej sama dua kali tetap dikira
    // sebagai SATU baris terjejas - kiraan ini tentang baris, bukan
    // bilangan entri konflik.
    for (const message of new Set(row.conflicts.map((conflict) => conflict.message))) {
      kiraan.set(message, (kiraan.get(message) ?? 0) + 1);
    }
  }

  return [...kiraan.entries()]
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message));
}

export function teksRingkasanKonflik(items: RingkasanKonflik[]): string {
  return items.map((item) => `- ${item.message} (${item.count} baris)`).join("\n");
}
