import { AdminPaymentLogTable } from "@/components/payments/admin-payment-log-table";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";
import { listAdminPaymentLogs } from "@/lib/payments/api";

export default async function AdminPaymentsPage() {
  const { accessToken, profile } = await wajibSesi("/admin/payments");

  if (!isManagement(profile)) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6">
        <PageBreadcrumb items={[{ href: "/profile", label: "Profil" }]} current="Bayaran admin" />
        <Card>
          <CardHeader><CardTitle>Akses ditolak</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Halaman ini hanya untuk pengurusan MARC.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { logs } = await listAdminPaymentLogs(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/profile", label: "Profil" }]} current="Bayaran admin" />
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Pengurusan</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Log bayaran
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Pantau event bayaran dan jalankan semakan rekonsiliasi gateway.
        </p>
      </header>
      <AdminPaymentLogTable
        initialLogs={logs}
        isSuperAdmin={profile.role_key === "superadmin"}
      />
    </div>
  );
}
