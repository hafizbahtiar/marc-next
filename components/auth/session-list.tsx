import { SessionTable } from "@/components/auth/session-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { senaraiSesi } from "@/lib/auth/api";

/**
 * Peranti yang sedang log masuk. Satu baris = satu family refresh token,
 * bukan satu token - backend sudah mengumpulkannya (lihat
 * groupSessionsByFamily, internal/http/handlers/sessions.go), jadi
 * putaran token tak menampakkan satu peranti sebagai banyak.
 */
export async function SessionList({ accessToken }: { accessToken: string }) {
  const sesi = await senaraiSesi(accessToken);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peranti yang log masuk</CardTitle>
        <CardDescription>
          Log keluar mana-mana peranti yang anda tak kenali.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionTable sessions={sesi} />
      </CardContent>
    </Card>
  );
}
