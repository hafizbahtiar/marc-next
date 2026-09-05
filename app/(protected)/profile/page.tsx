import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { wajibSesi } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Akaun anda</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Profil
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Urus maklumat peribadi dan identiti keahlian anda.
        </p>
      </header>
      <ProfileHeader profile={profile} />
      <ProfileInfoCard profile={profile} />
    </div>
  );
}
