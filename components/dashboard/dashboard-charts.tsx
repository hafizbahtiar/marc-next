"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/dashboard/api";

const activityConfig = {
  registrations: {
    label: "Pendaftaran",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const departmentConfig = {
  members: {
    label: "Ahli aktif",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const revenueConfig = {
  registration: {
    label: "Yuran pendaftaran",
    color: "var(--chart-1)",
  },
  activity: {
    label: "Yuran aktiviti",
    color: "var(--chart-2)",
  },
  donation: {
    label: "Sokongan MARC",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ActivityRegistrationChart({
  activities,
}: {
  activities: DashboardData["member"]["open_activities"];
}) {
  if (activities.length === 0) return null;

  const data = activities.map((activity) => ({
    name: shortLabel(activity.title),
    registrations: activity.registration_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pendaftaran aktiviti</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={activityConfig} className="h-[260px] w-full aspect-auto">
          <BarChart accessibilityLayer data={data} margin={{ left: -12, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="registrations" fill="var(--color-registrations)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardCharts({
  data,
}: {
  data: NonNullable<DashboardData["admin"]>;
}) {
  const departments = data.member_stats.by_department;
  const revenue = [
    { name: "registration", value: data.revenue_this_month.registration_cents },
    { name: "activity", value: data.revenue_this_month.activity_cents },
    { name: "donation", value: data.revenue_this_month.donation_cents ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {departments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ahli mengikut bahagian</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={departmentConfig} className="h-[260px] w-full aspect-auto">
              <BarChart accessibilityLayer data={departments} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="members" fill="var(--color-members)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : null}

      {revenue.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kutipan bulan ini</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[260px] w-full aspect-auto">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={revenue} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {revenue.map((entry) => (
                    <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function shortLabel(value: string): string {
  return value.length > 18 ? `${value.slice(0, 18)}…` : value;
}
