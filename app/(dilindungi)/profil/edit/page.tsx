import { BorangEditProfil } from "@/components/profil/borang-edit-profil";
import { wajibSesi } from "@/lib/auth/session";

export default async function EditProfilPage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-lg gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Edit profil
        </h1>
      </header>

      <BorangEditProfil profile={profile} />
    </div>
  );
}
