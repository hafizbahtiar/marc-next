import "server-only";

import { apiFetch } from "@/lib/api/client";

export type NotificationType =
  | "post_like"
  | "comment_like"
  | "post_comment"
  | "member_pending"
  | "member_approved"
  | "member_rejected"
  | "activity_published"
  | "activity_cancelled"
  | "activity_reminder"
  | "certificate_ready";

export type AppNotification = {
  id: string;
  actor_id: string;
  type: NotificationType | string;
  post_id: string | null;
  comment_id: string | null;
  activity_id: string | null;
  certificate_id: string | null;
  read: boolean;
  created_at: string;
};

export type NotificationPage = {
  notifications: AppNotification[];
  next_cursor: string | null;
};

export function listNotifications(token: string, cursor?: string): Promise<NotificationPage> {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiFetch<NotificationPage>(`/notifications${suffix}`, { accessToken: token });
}

export function markNotificationRead(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
    accessToken: token,
  });
}

export function markAllNotificationsRead(token: string): Promise<void> {
  return apiFetch<void>("/notifications/read-all", { method: "POST", accessToken: token });
}

export function deleteNotification(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${encodeURIComponent(id)}`, {
    method: "DELETE",
    accessToken: token,
  });
}

export function deleteReadNotifications(token: string): Promise<void> {
  return apiFetch<void>("/notifications/read", { method: "DELETE", accessToken: token });
}

export function deleteSelectedNotifications(token: string, ids: string[]): Promise<void> {
  return apiFetch<void>("/notifications/selected", {
    method: "DELETE",
    body: { ids },
    accessToken: token,
  });
}
