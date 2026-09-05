import { SessionList } from "@/components/auth/session-list";
import { wajibSesi } from "@/lib/auth/session";

export default async function SessionsPage() {
  const { accessToken } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Akaun</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Sesi aktif</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Log keluar mana-mana peranti yang anda tidak kenali.
        </p>
      </header>
      <SessionList accessToken={accessToken} />
    </div>
  );
}
