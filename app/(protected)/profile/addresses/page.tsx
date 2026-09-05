import { MapPinIcon } from "lucide-react";

import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { wajibSesi } from "@/lib/auth/session";
import { senaraiAlamat } from "@/lib/profile/addresses-api";

export default async function AddressesPage() {
  const { accessToken } = await wajibSesi();
  const addresses = await senaraiAlamat(accessToken);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <BackLink href="/profile">Kembali ke Profil</BackLink>
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <MapPinIcon className="size-4" />
          Profil
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Alamat Saya</h1>
        <p className="text-sm text-muted-foreground">{addresses.length}/3 alamat digunakan.</p>
      </header>
      {addresses.length === 0 ? (
        <p className="rounded-xl border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          Tiada alamat disimpan.
        </p>
      ) : (
        <div className="grid gap-3">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <MapPinIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{address.label || "Alamat"}</p>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    {[address.unit_number, address.floor, address.block, address.street, address.township]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {address.postcode} {address.city}, {address.state}
                  </p>
                </div>
                {address.is_default ? <Badge variant="secondary">Default</Badge> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
