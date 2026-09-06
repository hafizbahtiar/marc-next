/**
 * Keadaan bersama untuk borang auth.
 *
 * Ini duduk dalam failnya SENDIRI dan bukan bersama tindakan pelayan
 * yang menggunakannya: fail `"use server"` hanya boleh mengeksport
 * fungsi async, jadi pemalar `KEADAAN_AWAL` di sana akan lulus `next
 * build` tetapi meletup pada permintaan POST pertama dengan
 * "A 'use server' file can only export async functions, found object."
 */
export type KeadaanBorang = {
  /** Ralat merentas borang (biasanya mesej Bahasa Melayu daripada Go). */
  ralat?: string;
  /** Ralat per-medan daripada Zod, dikunci dengan nama medan borang. */
  medan?: Record<string, string>;
  /**
   * Nilai untuk mengisi semula borang selepas gagal. Medan kata laluan
   * SENGAJA tak pernah dimasukkan - menghantarnya semula ke klien
   * meletakkannya dalam muatan HTML dan sejarah pelayar.
   */
  nilai?: Record<string, string>;
  /** Mesej berjaya untuk borang yang kekal di halaman yang sama. */
  berjaya?: string;
};

export const KEADAAN_AWAL: KeadaanBorang = {};
