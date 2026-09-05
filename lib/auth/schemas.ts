import { z } from "zod";

import { normalkanTelefonMY } from "./phone";

/**
 * Peraturan pengesahan di sini MENCERMINKAN tag `binding` pada struct
 * permintaan Go (internal/http/handlers/auth.go). Ia bukan sumber
 * kebenaran - backend tetap mengesahkan segalanya sekali lagi - tetapi
 * ia yang memberi ahli maklum balas per-medan sebelum satu pun
 * permintaan rangkaian dihantar.
 */

const emel = z
  .string()
  .trim()
  .min(1, "Emel diperlukan.")
  // `.refine` dengan `z.email()` dan bukan `.email()` terus: bentuk
  // `.email()` sebagai kaedah string sudah usang dalam Zod 4, dan
  // `.pipe(z.email())` akan menelan mesej "Emel diperlukan." untuk input
  // kosong kerana pemeriksaan e-mel juga gagal pada rentetan kosong.
  .refine((v) => z.email().safeParse(v).success, "Format emel tidak sah.")
  .transform((v) => v.toLowerCase());

/**
 * `max(72)` bukan pilihan gaya: bcrypt memotong pada 72 bait, dan
 * backend menguatkuasakannya (`min=6,max=72`). Menerima kata laluan yang
 * lebih panjang di sini akan menghasilkan 400 selepas ahli menaipnya
 * dua kali.
 */
const kataLaluanBaharu = z
  .string()
  .min(6, "Kata laluan mesti sekurang-kurangnya 6 aksara.")
  .max(72, "Kata laluan tidak boleh melebihi 72 aksara.");

export const skemaLogMasuk = z.object({
  email: emel,
  // Tiada had panjang minimum di sini selain "ada isi". Kata laluan
  // sedia ada yang tak memenuhi peraturan hari ini masih mesti boleh log
  // masuk - peraturan panjang tertakluk kepada penetapan kata laluan,
  // bukan penggunaannya.
  password: z.string().min(1, "Kata laluan diperlukan.").max(72),
});

export const skemaDaftar = z
  .object({
    email: emel,
    password: kataLaluanBaharu,
    sahkan_password: z.string().min(1, "Sahkan kata laluan anda."),
    phone: z
      .string()
      .trim()
      .min(1, "Nombor telefon diperlukan.")
      .refine((v) => normalkanTelefonMY(v) !== null, {
        message: "Nombor telefon Malaysia tidak sah (cth 012-345 6789).",
      })
      .transform((v) => normalkanTelefonMY(v)!),
    staff_id: z
      .string()
      .trim()
      .min(1, "Nombor staf diperlukan.")
      .max(64, "Nombor staf tidak boleh melebihi 64 aksara.")
      // Backend menolak '/' kerana nombor staf dibenamkan ke dalam
      // member_id berformat `MARC-{staffID}/{tahun}-{kod}`, di mana '/'
      // ialah pemisah medan.
      .refine((v) => !v.includes("/"), {
        message: "Nombor staf tidak boleh mengandungi '/'.",
      }),
  })
  .refine((d) => d.password === d.sahkan_password, {
    message: "Kata laluan tidak sepadan.",
    path: ["sahkan_password"],
  });

export const skemaLupaKataLaluan = z.object({ email: emel });

export const skemaTetapKataLaluan = z
  .object({
    token: z.string().min(1, "Pautan tidak sah."),
    password: kataLaluanBaharu,
    sahkan_password: z.string().min(1, "Sahkan kata laluan anda."),
  })
  .refine((d) => d.password === d.sahkan_password, {
    message: "Kata laluan tidak sepadan.",
    path: ["sahkan_password"],
  });
