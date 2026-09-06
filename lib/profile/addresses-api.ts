import "server-only";

import { apiFetch } from "@/lib/api/client";

export type Address = {
  id: string;
  label: string | null;
  is_default: boolean;
  address_type: string;
  unit_number: string | null;
  floor: string | null;
  block: string | null;
  street: string | null;
  township: string | null;
  city: string;
  postcode: string;
  state: string;
};

export async function listAddresses(accessToken: string): Promise<Address[]> {
  return (await apiFetch<Address[] | null>("/me/addresses", { accessToken })) ?? [];
}

export function createAddress(
  accessToken: string,
  body: {
    address_type: "landed" | "highrise";
    unit_number: string;
    floor?: string;
    block?: string;
    street: string;
    township: string;
    city: string;
    postcode: string;
    state: string;
    is_default: boolean;
  },
): Promise<Address> {
  return apiFetch<Address>("/me/addresses", { method: "POST", body, accessToken });
}
