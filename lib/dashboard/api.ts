import "server-only";

import { apiFetch } from "@/lib/api/client";

export type DashboardData = {
  member: {
    membership: {
      status: string;
      member_id: string | null;
      staff_id_verified: boolean;
      outstanding_registration_fee_cents: number | null;
    };
    certificates_total: number;
    total_members: number;
    open_activities: Array<{
      id: string;
      title: string;
      starts_at: string;
      category_name: string;
      fee_cents: number;
      currency: string;
      registration_count: number;
    }>;
  };
  admin: {
    pending_approvals: number;
    revenue_this_month: {
      currency: string;
      registration_cents: number;
      activity_cents: number;
      donation_cents: number | null;
      total_cents: number;
    };
    member_stats: {
      active: number;
      pending: number;
      new_this_month: number;
      by_department: Array<{ code: string; name: string; count: number }>;
    };
    activity_stats: {
      upcoming: number;
      registrations_this_month: number;
      attendance_rate: number | null;
    };
  } | null;
};

export function getDashboard(accessToken: string): Promise<DashboardData> {
  return apiFetch<DashboardData>("/dashboard", { accessToken });
}
