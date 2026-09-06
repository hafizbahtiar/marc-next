import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Profile } from "@/lib/api/types";

/**
 * Pembalut nipis atas `PATCH /me` - padanan `lib/auth/api.ts`/`lib/posts/api.ts`
 * untuk domain profil. `GET /me` sudah wujud sebagai `lib/auth/api.ts`'s
 * `me()`; fail ni cuma tambah bahagian TULIS.
 */
export function kemaskiniProfil(
  accessToken: string,
  body: {
    display_name: string;
    phone: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    health_notes: string;
    updated_at: string;
    avatar_r2_key?: string;
  },
): Promise<Profile> {
  return apiFetch<Profile>("/me", { method: "PATCH", body, accessToken });
}
