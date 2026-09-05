import { Building2Icon } from "lucide-react";

import { DepartmentTable } from "@/components/admin/settings-management-tables";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { wajibSesi } from "@/lib/auth/session";
import { listDepartments } from "@/lib/admin/settings-api";

export default async function DepartmentsPage() {
  const { accessToken, profile } = await wajibSesi();
  if (profile.role_key !== "superadmin") {
    return <AccessDenied />;
  }
  const { departments } = await listDepartments(accessToken);
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Bahagian/jabatan" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary"><Building2Icon className="size-4" /> Sistem</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Bahagian/Jabatan</h1>
      </header>
      <DepartmentTable rows={departments} />
    </div>
  );
}

function AccessDenied() {
  return <div className="mx-auto grid max-w-6xl gap-4"><PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Bahagian/jabatan" /><h1 className="font-heading text-3xl font-semibold tracking-tight">Bahagian/Jabatan</h1><p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Skrin ini untuk superadmin sahaja.</p></div>;
}
