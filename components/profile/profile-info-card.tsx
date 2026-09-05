import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/api/types";

export function ProfileInfoCard({ profile }: { profile: Profile }) {
  return (
    <Card>
      <CardContent className="grid divide-y divide-border/70 p-0">
        <DataRow label="Emel" nilai={profile.email} />
        <DataRow label="No. telefon" nilai={profile.phone ?? "-"} />
        <DataRow label="No. ahli" nilai={profile.member_id ?? "Belum dijana"} />
        <DataRow
          label="Status emel"
          nilai={profile.email_verified ? "Disahkan" : "Belum disahkan"}
          nilaiClass={profile.email_verified ? "text-primary" : "text-amber-600 dark:text-amber-400"}
        />
        {profile.department_name ? (
          <DataRow label="Bahagian" nilai={profile.department_name} />
        ) : null}
        {profile.position ? <DataRow label="Jawatan" nilai={profile.position} /> : null}
      </CardContent>
    </Card>
  );
}

function DataRow({
  label,
  nilai,
  nilaiClass,
}: {
  label: string;
  nilai: string;
  nilaiClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right font-medium ${nilaiClass ?? ""}`}>{nilai}</dd>
    </div>
  );
}
