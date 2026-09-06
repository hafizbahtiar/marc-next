import "server-only";

import { apiFetch } from "@/lib/api/client";

export type AccountDeletionRequest = {
  user_id: string;
  member_id: string | null;
  display_name: string | null;
  email: string;
  role_key: string;
  account_status: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
};

export function listAccountDeletionRequests(token: string) {
  return apiFetch<{ requests: AccountDeletionRequest[] }>("/admin/account-deletion-requests", {
    accessToken: token,
  });
}

export function executeAccountDeletion(token: string, userId: string) {
  return apiFetch<{ ok: boolean; user_id: string }>(
    `/admin/account-deletion-requests/${encodeURIComponent(userId)}/execute`,
    { method: "POST", accessToken: token },
  );
}
