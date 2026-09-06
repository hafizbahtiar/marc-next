import { redirect } from "next/navigation";

import { AppShell } from "@/components/marc/app-shell";
import { ROUTES } from "@/lib/auth/routes";
import { dapatkanSesi } from "@/lib/auth/session";

/**
 * Skrin status akaun. Memerlukan sesi tetapi SENGAJA tidak memanggil
 * `skrinGate` - halaman di dalamnya ialah destinasi gate itu, jadi
 * menguatkuasakannya di sini akan mengubah hala setiap satu kepada
 * dirinya sendiri. Setiap halaman menyemak keadaannya sendiri dan
 * mengubah hala keluar apabila keadaan itu tak lagi terpakai.
 */
export default async function AccountLayout({ children }: LayoutProps<"/">) {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect(ROUTES.tamatSesi);

  return <AppShell profile={sesi.profile}>{children}</AppShell>;
}
