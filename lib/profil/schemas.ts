import { z } from "zod";

import { normalkanTelefonMY } from "../auth/phone";

/**
 * Peraturan di sini MENCERMINKAN had backend PATCH /me
 * (updateMeRequest, internal/http/handlers/profile.go) - bukan sumber
 * kebenaran, tetapi maklum balas per-medan sebelum permintaan rangkaian.
 *
 * Borang ini SENTIASA menghantar SETIAP medan (bukan patch separa):
 * medan kosong bermaksud ahli sengaja buang nilai itu, bukan "tak
 * diubah" - borang sentiasa disemai dgn nilai semasa dahulu.
 */

const namaPilihan = z
  .string()
  .trim()
  .max(100, "Maksimum 100 aksara.");

const nomborTelefonPilihan = z
  .string()
  .trim()
  .max(30, "Maksimum 30 aksara.")
  .refine((v) => v === "" || normalkanTelefonMY(v) !== null, {
    message: "Format nombor telefon tidak sah (cth 012-345 6789).",
  })
  .transform((v) => (v === "" ? "" : normalkanTelefonMY(v)!));

export const skemaKemaskiniProfil = z.object({
  display_name: namaPilihan,
  phone: nomborTelefonPilihan,
  emergency_contact_name: namaPilihan,
  emergency_contact_phone: nomborTelefonPilihan,
  health_notes: z.string().trim().max(500, "Maksimum 500 aksara."),
});
