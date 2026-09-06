import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getDashboard } from "@/lib/dashboard/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { accessToken, profile } = await wajibSesi();
  const dashboard = await getDashboard(accessToken);
  return <DashboardContent profile={profile} data={dashboard} />;
}
