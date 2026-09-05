import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logKeluarAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logKeluarAction} className="flex min-h-16 items-center justify-between gap-4 px-4 py-0">
      <span className="flex items-center gap-2 text-sm font-medium">
        <LogOutIcon className="size-4 text-destructive" />
        Log keluar device ini
      </span>
      <Button type="submit" size="sm" variant="outline" className="text-destructive">
        Log keluar
      </Button>
    </form>
  );
}
