import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { wajibSesi } from "@/lib/auth/session";

export default async function EditProfilePage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <PageBreadcrumb items={[{ href: "/profile", label: "Profil" }]} current="Edit profil" />
      <header>
        <p className="text-sm font-medium text-primary">Akaun anda</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance">
          Edit profil
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pastikan maklumat anda sentiasa tepat dan terkini.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maklumat peribadi</CardTitle>
          <CardDescription>
            Perubahan akan digunakan pada profil keahlian anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
