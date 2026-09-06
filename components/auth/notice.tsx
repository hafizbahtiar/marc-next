import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Maklum balas peringkat borang.
 *
 * `role="status"` untuk kejayaan dan `role="alert"` (lalai `Alert`)
 * untuk kegagalan: yang pertama diumumkan dengan sopan, yang kedua
 * mengganggu. Kejayaan yang mengganggu bacaan semasa pengguna adalah
 * bising; kegagalan yang menunggu giliran boleh terlepas sepenuhnya.
 */
export function Notice({
  ralat,
  berjaya,
}: {
  ralat?: string;
  berjaya?: string;
}) {
  if (berjaya) {
    return (
      <Alert role="status" className="border-primary/25 bg-primary/5">
        <CircleCheckIcon className="text-primary" aria-hidden />
        <AlertDescription className="text-foreground/80">{berjaya}</AlertDescription>
      </Alert>
    );
  }
  if (ralat) {
    return (
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
        <CircleAlertIcon aria-hidden />
        <AlertDescription>{ralat}</AlertDescription>
      </Alert>
    );
  }
  return null;
}
