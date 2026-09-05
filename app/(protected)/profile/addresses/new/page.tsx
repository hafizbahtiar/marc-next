import { MapPinIcon } from "lucide-react";

import { AddressForm } from "@/components/profile/address-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";

export default function NewAddressPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/profile", label: "Profil" }, { href: "/profile/addresses", label: "Alamat" }]} current="Tambah alamat" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <MapPinIcon className="size-4" />
          Profil
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Tambah Alamat</h1>
      </header>
      <AddressForm />
    </div>
  );
}
