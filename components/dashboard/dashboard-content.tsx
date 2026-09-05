import Link from "next/link";
import {
  AwardIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  UsersIcon,
} from "lucide-react";

import { StatusBadge, statusTone } from "@/components/marc/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/dashboard/api";
import type { Profile } from "@/lib/api/types";

export function DashboardContent({ profile, data }: { profile: Profile; data: DashboardData }) {
  const outstanding = data.member.membership.outstanding_registration_fee_cents;

  return (
    <div className="grid gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-primary px-5 py-8 text-primary-foreground shadow-sm sm:px-8 sm:py-10">
        <div className="relative z-10 grid gap-4">
          <div>
            <p className="text-sm text-primary-foreground/75">Ruang ahli MARC</p>
            <h1 className="mt-1 max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Selamat kembali{profile.display_name ? `, ${profile.display_name}` : ""}.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={membershipLabel(data.member.membership.status)}
              tone={statusTone(data.member.membership.status)}
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
            />
            {data.member.membership.member_id ? (
              <span className="text-sm text-primary-foreground/75">{data.member.membership.member_id}</span>
            ) : null}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-20 size-56 rounded-full bg-primary-foreground/10" />
      </header>

      {outstanding !== null ? (
        <Card className="border-secondary bg-secondary text-secondary-foreground">
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <CircleDollarSignIcon className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">Yuran pendaftaran belum dijelaskan</p>
                <p className="mt-1 text-2xl font-semibold">{formatMoney(outstanding, "MYR")}</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/payments/history">Lihat bayaran</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={AwardIcon} label="Sijil saya" value={data.member.certificates_total} description="Jumlah sijil diterima" />
        <StatCard icon={UsersIcon} label="Ahli berdaftar" value={data.member.total_members} description="Jumlah ahli dalam MARC" />
      </section>

      <section className="grid gap-4">
        <SectionHeading title="Aktiviti terbuka" />
        {data.member.open_activities.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Tiada aktiviti terbuka buat masa ini.</CardContent></Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="grid divide-y p-0">
              {data.member.open_activities.map((activity) => (
                <div key={activity.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{activity.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(activity.starts_at)} · {activity.category_name || "Aktiviti"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant="outline">{activity.fee_cents > 0 ? formatMoney(activity.fee_cents, activity.currency) : "Percuma"}</Badge>
                    <Badge variant="secondary">{activity.registration_count} berdaftar</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {data.admin ? <AdminDashboard data={data.admin} /> : null}
    </div>
  );
}

function AdminDashboard({ data }: { data: NonNullable<DashboardData["admin"]> }) {
  const revenue = data.revenue_this_month;
  const attendance = data.activity_stats.attendance_rate === null
    ? "-"
    : `${Math.round(data.activity_stats.attendance_rate * 100)}%`;

  return (
    <section className="grid gap-4">
      <SectionHeading title="Perlu perhatian" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionStatCard href="/members/pending" icon={Clock3Icon} label="Menunggu kelulusan" value={data.pending_approvals} tone={data.pending_approvals > 0 ? "warning" : "neutral"} />
        <ActionStatCard href="/members" icon={CalendarDaysIcon} label="Aktiviti akan datang" value={data.activity_stats.upcoming} />
        <ActionStatCard href="/members" icon={UsersIcon} label="Ahli aktif" value={data.member_stats.active} />
        <ActionStatCard href="/payments/history" icon={CircleDollarSignIcon} label="Kutipan bulan ini" value={formatMoney(revenue.total_cents, revenue.currency)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Statistik ahli</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Metric label="Aktif" value={data.member_stats.active} />
            <Metric label="Pending" value={data.member_stats.pending} />
            <Metric label="Baharu bulan ini" value={data.member_stats.new_this_month} />
            {data.member_stats.by_department.length > 0 ? (
              <div className="grid gap-2 border-t pt-4 sm:col-span-3">
                {data.member_stats.by_department.map((department) => (
                  <div key={department.code} className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{department.name}</span>
                    <span className="font-medium">{department.count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Statistik aktiviti</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Metric label="Pendaftaran bulan ini" value={data.activity_stats.registrations_this_month} />
            <Metric label="Kehadiran" value={attendance} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, description }: { icon: typeof AwardIcon; label: string; value: number; description: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
        <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>
      </CardContent>
    </Card>
  );
}

function ActionStatCard({ href, icon: Icon, label, value, tone = "neutral" }: { href: string; icon: typeof Clock3Icon; label: string; value: number | string; tone?: "warning" | "neutral" }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
          <span className={`grid size-10 place-items-center rounded-xl ${tone === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}><Icon className="size-5" /></span>
        </CardContent>
      </Card>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div><p className="text-xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="font-heading text-xl font-semibold">{title}</h2>;
}

function membershipLabel(status: string) {
  return status === "approved" ? "Ahli diluluskan" : status === "pending" ? "Menunggu kelulusan" : status === "rejected" ? "Permohonan ditolak" : "Status tidak diketahui";
}

function formatMoney(cents: number, currency: string) {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
