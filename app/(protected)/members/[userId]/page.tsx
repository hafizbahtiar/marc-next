import { MailIcon, MapPinIcon, PhoneIcon, UserRoundIcon } from "lucide-react";

import { BackLink } from "@/components/ui/back-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wajibSesi } from "@/lib/auth/session";
import { getMemberDetail } from "@/lib/members/api";

export default async function MemberDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { accessToken } = await wajibSesi();
  const member = await getMemberDetail(accessToken, userId);
  const name = member.display_name?.trim() || member.member_id || "Belum disahkan";

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <BackLink href="/members">Kembali ke Ahli</BackLink>
      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center">
        <Avatar className="size-20 ring-4 ring-secondary">
          {member.avatar_url ? <AvatarImage src={member.avatar_url} alt="" /> : null}
          <AvatarFallback className="text-xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-2xl font-semibold">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{member.member_id ?? "Belum disahkan"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{member.role_name}</Badge>
            {member.is_active ? <Badge variant="outline">Aktif</Badge> : <Badge variant="destructive">Tidak aktif</Badge>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Maklumat ahli</CardTitle></CardHeader>
          <CardContent className="grid gap-4 text-sm">
            {member.email ? <InfoRow icon={MailIcon} label="Emel" value={member.email} /> : null}
            {member.phone ? <InfoRow icon={PhoneIcon} label="Telefon" value={member.phone} /> : null}
            {member.staff_id ? <InfoRow icon={UserRoundIcon} label="No. staff" value={member.staff_id} /> : null}
            {member.department_name ? <InfoRow icon={UserRoundIcon} label="Bahagian" value={member.department_name} /> : null}
            {member.position ? <InfoRow icon={UserRoundIcon} label="Jawatan" value={member.position} /> : null}
          </CardContent>
        </Card>
        {member.addresses !== null ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Alamat</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {member.addresses.length === 0 ? <p className="text-muted-foreground">Tiada alamat disimpan.</p> : member.addresses.map((address) => (
                <div key={address.id} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p>{address.label || "Alamat"}<br /><span className="text-muted-foreground">{[address.street, address.postcode, address.city, address.state].filter(Boolean).join(", ")}</span></p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MailIcon; label: string; value: string }) {
  return <div className="flex items-center gap-3"><Icon className="size-4 text-muted-foreground" /><span className="w-24 text-muted-foreground">{label}</span><span className="min-w-0 truncate font-medium">{value}</span></div>;
}
