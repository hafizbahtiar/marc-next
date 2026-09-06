import "server-only";

import { apiFetch } from "@/lib/api/client";

export type ActivitySession = {
  id: string;
  seq: number;
  title: string;
  starts_at: string;
  ends_at: string;
};

export type ActivityCategory = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type Activity = {
  id: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  location_name: string;
  location_address: string;
  starts_at: string;
  ends_at: string;
  registration_opens_at: string | null;
  registration_closes_at: string;
  capacity: number | null;
  fee_cents: number;
  currency: string;
  attendance_threshold_pct: number;
  status: "draft" | "published" | "cancelled" | "completed" | string;
  cancelled_reason: string | null;
  certificates_issued_at: string | null;
  registration_count: number;
  is_registered: boolean;
  sessions: ActivitySession[];
};

export type ActivityListResponse = {
  activities: Activity[];
  next_cursor: string | null;
};

export type MyRegistration = {
  id: string;
  activity_id: string;
  status: string;
  checkin_token: string;
  registered_at: string;
  title: string;
  starts_at: string;
  ends_at: string;
  activity_status: string;
  category_name: string;
  payment_status: "not_required" | "pending" | "paid" | "refunded" | string;
  fee_cents: number | null;
  currency: string;
};

export type MyRegistrationsResponse = {
  registrations: MyRegistration[];
};

export type MyCertificate = {
  id: string;
  activity_id: string;
  serial: string;
  recipient_name: string;
  activity_title: string;
  category_name: string;
  activity_date: string;
  issued_at: string;
  file_ready: boolean;
};

export type MyCertificatesResponse = {
  certificates: MyCertificate[];
};

export type RegistrationResponse = {
  registration: {
    id: string;
    payment_status?: string;
  };
};

export type CheckoutResponse = {
  redirect_url: string;
};

export type ActivityRegistrant = {
  id: string;
  user_id: string;
  status: string;
  member_id: string;
  display_name: string;
  registered_at: string;
  attended_session_ids: string[];
};

export type ActivityRegistrantsResponse = {
  registrations: ActivityRegistrant[];
};

export type ActivityInput = {
  category_id: string;
  title: string;
  description: string;
  location_name: string;
  location_address: string;
  registration_opens_at?: string | null;
  registration_closes_at: string;
  capacity: number | null;
  fee_cents: number;
  attendance_threshold_pct: number;
};

export type ActivitySessionInput = {
  seq: number;
  title: string;
  starts_at: string;
  ends_at: string;
};

export type IssueCertificatesResponse = {
  issued: number;
  files_ready: number;
  message: string;
};

export function listActivities(
  token: string,
  options: { upcoming?: boolean; categoryId?: string; cursor?: string; limit?: number } = {},
): Promise<ActivityListResponse> {
  const params = new URLSearchParams({
    upcoming: String(options.upcoming ?? true),
    limit: String(options.limit ?? 20),
  });
  if (options.categoryId) params.set("category_id", options.categoryId);
  if (options.cursor) params.set("cursor", options.cursor);
  return apiFetch<ActivityListResponse>(`/activities?${params.toString()}`, { accessToken: token }).then((response) => ({
    ...response,
    activities: response.activities ?? [],
  }));
}

export async function getActivity(token: string, id: string): Promise<Activity> {
  const activity = await apiFetch<Activity>(`/activities/${encodeURIComponent(id)}`, { accessToken: token });
  return { ...activity, sessions: activity.sessions ?? [] };
}

export async function listActivityCategories(token: string): Promise<{ categories: ActivityCategory[] }> {
  const response = await apiFetch<{ categories: ActivityCategory[] | null }>("/activity-categories", { accessToken: token });
  return { categories: response.categories ?? [] };
}

export function registerActivity(token: string, id: string): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>(`/activities/${encodeURIComponent(id)}/registration`, {
    method: "POST",
    accessToken: token,
  });
}

export function cancelActivity(token: string, id: string): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>(`/activities/${encodeURIComponent(id)}/registration`, {
    method: "DELETE",
    accessToken: token,
  });
}

export function checkoutActivity(
  token: string,
  id: string,
  phone?: string,
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>(`/activities/${encodeURIComponent(id)}/registration/checkout`, {
    method: "POST",
    body: phone ? { phone } : undefined,
    accessToken: token,
  });
}

export function listMyActivities(token: string): Promise<MyRegistrationsResponse> {
  return apiFetch<MyRegistrationsResponse>("/me/activities", { accessToken: token });
}

export function listMyCertificates(token: string): Promise<MyCertificatesResponse> {
  return apiFetch<MyCertificatesResponse>("/me/certificates", { accessToken: token });
}

export function getCertificateFile(token: string, id: string): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(`/me/certificates/${encodeURIComponent(id)}/file`, {
    accessToken: token,
  });
}

export function createManagedActivity(
  token: string,
  body: ActivityInput & { sessions: ActivitySessionInput[] },
): Promise<Activity> {
  return apiFetch<Activity>("/activities", { method: "POST", body, accessToken: token });
}

export function updateManagedActivity(
  token: string,
  id: string,
  body: Partial<ActivityInput>,
): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
    accessToken: token,
  });
}

export function replaceActivitySessions(
  token: string,
  id: string,
  sessions: ActivitySessionInput[],
): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${encodeURIComponent(id)}/sessions`, {
    method: "PUT",
    body: { sessions },
    accessToken: token,
  });
}

export function publishManagedActivity(token: string, id: string): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    accessToken: token,
  });
}

export function cancelManagedActivity(token: string, id: string, reason: string): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: { reason },
    accessToken: token,
  });
}

export function listActivityRegistrants(token: string, id: string): Promise<ActivityRegistrantsResponse> {
  return apiFetch<ActivityRegistrantsResponse>(`/activities/${encodeURIComponent(id)}/registrations`, {
    accessToken: token,
  });
}

export function markAttendance(
  token: string,
  activityId: string,
  sessionId: string,
  registrationId: string,
  amendReason?: string,
): Promise<{ created: boolean }> {
  return apiFetch<{ created: boolean }>(`/activities/${encodeURIComponent(activityId)}/sessions/${encodeURIComponent(sessionId)}/attendance`, {
    method: "POST",
    body: { registration_id: registrationId, method: "manual", ...(amendReason ? { amend: true, reason: amendReason } : {}) },
    accessToken: token,
  });
}

export function unmarkAttendance(
  token: string,
  activityId: string,
  sessionId: string,
  registrationId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/activities/${encodeURIComponent(activityId)}/sessions/${encodeURIComponent(sessionId)}/attendance/${encodeURIComponent(registrationId)}`, {
    method: "DELETE",
    accessToken: token,
  });
}

export function selfCheckIn(
  token: string,
  activityId: string,
  sessionId: string,
): Promise<{ created: boolean }> {
  return apiFetch<{ created: boolean }>(`/activities/${encodeURIComponent(activityId)}/sessions/${encodeURIComponent(sessionId)}/attendance`, {
    method: "POST",
    body: { method: "self_scan" },
    accessToken: token,
  });
}

export function scanAttendanceByToken(
  token: string,
  activityId: string,
  sessionId: string,
  checkinToken: string,
): Promise<{ created: boolean; member?: { display_name?: string; member_id?: string } }> {
  return apiFetch<{ created: boolean; member?: { display_name?: string; member_id?: string } }>(`/activities/${encodeURIComponent(activityId)}/sessions/${encodeURIComponent(sessionId)}/attendance`, {
    method: "POST",
    body: { checkin_token: checkinToken, method: "scan" },
    accessToken: token,
  });
}

export function issueCertificates(token: string, id: string): Promise<IssueCertificatesResponse> {
  return apiFetch<IssueCertificatesResponse>(`/activities/${encodeURIComponent(id)}/certificates`, {
    method: "POST",
    accessToken: token,
    signal: AbortSignal.timeout(5 * 60 * 1000),
  });
}
