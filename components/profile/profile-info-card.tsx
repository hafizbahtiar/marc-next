import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/api/types";

export function ProfileInfoCard({ profile }: { profile: Profile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Maklumat</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <DataRow label="Emel" nilai={profile.email} />
          <DataRow label="No. telefon" nilai={profile.phone ?? "-"} />
          <DataRow label="No. ahli" nilai={profile.member_id ?? "Belum dijana"} />
          <DataRow
            label="Status emel"
            nilai={profile.email_verified ? "Disahkan" : "Belum disahkan"}
          />
          {profile.department_name ? (
            <DataRow label="Bahagian" nilai={profile.department_name} />
          ) : null}
          {profile.position ? <DataRow label="Jawatan" nilai={profile.position} /> : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function DataRow({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="border-b border-border/70 pb-2.5 last:border-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{nilai}</dd>
    </div>
  );
}
