import { Card, CardContent } from "@/components/ui/card";

/**
 * Kumpulan tetapan berlabel - padanan `SettingsGroupLabel` + `SettingsCard`
 * Flutter (shared/ui/widgets/settings_section.dart), digabung jadi SATU
 * komponen supaya jarak antara label dan kad tak boleh terlepas.
 */
export function SettingsCard({
  label,
  children,
  id,
}: {
  label: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 grid gap-3">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">
        {label}
      </h2>
      <Card>
        <CardContent className="grid divide-y divide-border/70 p-0">{children}</CardContent>
      </Card>
    </section>
  );
}
