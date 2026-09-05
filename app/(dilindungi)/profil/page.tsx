import { HeaderProfil } from "@/components/profil/header-profil";
import { KadInfoProfil } from "@/components/profil/kad-info-profil";
import { wajibSesi } from "@/lib/auth/session";

export default async function ProfilPage() {
  const { profile } = await wajibSesi();

  return (
    <div className="grid gap-6">
      <HeaderProfil profile={profile} />
      <KadInfoProfil profile={profile} />
    </div>
  );
}
