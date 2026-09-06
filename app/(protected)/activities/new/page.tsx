import { notFound } from "next/navigation";

import { ActivityForm } from "@/components/activities/activity-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { listActivityCategories } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function NewActivityPage() {
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const { categories } = await listActivityCategories(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/activities", label: "Aktiviti" }]} current="Aktiviti baharu" />
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Pengurusan aktiviti</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Aktiviti baharu</h1>
        <p className="text-sm leading-6 text-muted-foreground">Cipta aktiviti sebagai draf sebelum diterbitkan.</p>
      </header>
      <ActivityForm categories={categories} />
    </div>
  );
}
