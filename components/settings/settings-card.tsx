import { Card, CardContent } from "@/components/ui/card";

/**
 * Kumpulan tetapan berlabel - padanan `SettingsGroupLabel` + `SettingsCard`
 * Flutter (shared/ui/widgets/settings_section.dart), digabung jadi SATU
 * komponen supaya jarak antara label dan kad tak boleh terlepas.
 */
export function SettingsCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">
        {label}
      </h2>
      <Card>
        <CardContent className="grid divide-y divide-border/70 p-0">{children}</CardContent>
      </Card>
    </div>
  );
}
