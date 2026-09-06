import { notFound } from "next/navigation";

import { ActivityForm } from "@/components/activities/activity-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { getActivity, listActivityCategories } from "@/lib/activities/api";
import { isManagement } from "@/lib/api/types";
import { wajibSesi } from "@/lib/auth/session";

export default async function EditActivityPage({ params }: PageProps<"/activities/[id]/edit">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();
  if (!isManagement(profile)) notFound();
  const [activity, { categories }] = await Promise.all([
    getActivity(accessToken, id),
    listActivityCategories(accessToken),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb
        items={[
          { href: "/activities", label: "Aktiviti" },
          { href: `/activities/${encodeURIComponent(activity.id)}`, label: activity.title },
        ]}
        current="Sunting"
      />
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Pengurusan aktiviti</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Sunting aktiviti</h1>
        <p className="text-sm leading-6 text-muted-foreground">{activity.title}</p>
      </header>
      <ActivityForm categories={categories} activity={activity} />
    </div>
  );
}
