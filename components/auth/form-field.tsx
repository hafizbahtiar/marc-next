import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Satu medan borang: label, input, dan ralat.
 *
 * `aria-invalid` dan `aria-describedby` dipasang bersama, bukan salah
 * satu. Tanpa `describedby`, pembaca skrin mengumumkan bahawa medan itu
 * tak sah tetapi tidak mengapa yang salah - pengguna dengar amaran tanpa
 * arahan.
 */
export function FormField({
  name,
  label,
  ralat,
  petunjuk,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  ralat?: string;
  petunjuk?: string;
}) {
  const idRalat = `${name}-ralat`;
  const idPetunjuk = `${name}-petunjuk`;
  const describedBy = [ralat ? idRalat : null, petunjuk ? idPetunjuk : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-[13px] font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={ralat ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn("h-10 rounded-md px-3", className)}
        {...props}
      />
      {petunjuk ? (
        <p id={idPetunjuk} className="text-xs text-muted-foreground">
          {petunjuk}
        </p>
      ) : null}
      {ralat ? (
        <p id={idRalat} className="text-xs font-medium text-destructive">
          {ralat}
        </p>
      ) : null}
    </div>
  );
}
