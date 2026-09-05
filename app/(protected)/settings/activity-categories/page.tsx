import { Layers3Icon } from "lucide-react";

import { CategoryTable } from "@/components/admin/settings-management-tables";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { wajibSesi } from "@/lib/auth/session";
import { listActivityCategories } from "@/lib/admin/settings-api";

export default async function ActivityCategoriesPage() {
  const { accessToken, profile } = await wajibSesi();
  if (!["admin", "superadmin"].includes(profile.role_key)) {
    return <AccessDenied title="Urus Kategori" />;
  }
  const { categories } = await listActivityCategories(accessToken);
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Urus kategori" />
      <header className="grid gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-primary"><Layers3Icon className="size-4" /> Aktiviti</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Urus Kategori</h1>
      </header>
      <CategoryTable rows={categories} />
    </div>
  );
}

function AccessDenied({ title }: { title: string }) {
  return <div className="mx-auto grid max-w-6xl gap-4"><PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current={title} /><h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1><p className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Anda tiada akses ke skrin ini.</p></div>;
}
