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

export function senaraiAlamat(accessToken: string): Promise<Address[]> {
  return apiFetch<Address[]>("/me/addresses", { accessToken });
}
