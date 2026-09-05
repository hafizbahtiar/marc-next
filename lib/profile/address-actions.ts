"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { accessToken } from "@/lib/auth/session";
import { createAddress } from "./addresses-api";

const schemaAlamat = z.object({
  address_type: z.enum(["landed", "highrise"]),
  unit_number: z.string().trim().min(1, "No. rumah/unit diperlukan"),
  floor: z.string().trim(),
  block: z.string().trim(),
  street: z.string().trim(),
  township: z.string().trim(),
  city: z.string().trim().min(1, "Bandar diperlukan"),
  postcode: z.string().trim().regex(/^\d{5}$/, "Poskod mesti 5 digit"),
  state: z.string().trim().min(1, "Negeri diperlukan"),
  is_default: z.string().optional(),
});

export type AddressFormState = {
  error?: string;
  fields?: Record<string, string>;
  success?: string;
};

export async function createAddressAction(
  _previous: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schemaAlamat.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fields[key]) fields[key] = issue.message;
    }
    return { fields };
  }

  const token = await accessToken();
  if (!token) return { error: "Sesi anda sudah tamat." };

  try {
    await createAddress(token, {
      ...parsed.data,
      floor: parsed.data.address_type === "highrise" ? parsed.data.floor : undefined,
      block: parsed.data.address_type === "highrise" ? parsed.data.block : undefined,
      is_default: parsed.data.is_default === "on",
    });
  } catch {
    return { error: "Gagal simpan alamat. Cuba lagi." };
  }

  revalidatePath("/profile/addresses");
  return { success: "Alamat disimpan." };
}
