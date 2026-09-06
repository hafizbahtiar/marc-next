import "server-only";

import { apiFetch } from "@/lib/api/client";

export type BannedMember = {
  user_id: string;
  member_id: string | null;
  display_name: string | null;
  email: string;
  role_key: string;
  banned_at: string;
  ban_expires_at: string | null;
  ban_reason: string;
  banned_by: string | null;
};

export async function listBannedMembers(token: string) {
  const response = await apiFetch<{ members: BannedMember[] | null }>("/admin/banned-members", {
    accessToken: token,
  });
  return { members: response.members ?? [] };
}

export function banMember(
  token: string,
  userId: string,
  body: { expires_at?: string; reason: string },
) {
  return apiFetch<BannedMember>(`/admin/members/${encodeURIComponent(userId)}/ban`, {
    method: "POST",
    body,
    accessToken: token,
  });
}

export function unbanMember(token: string, userId: string) {
  return apiFetch<{ user_id: string; banned: boolean }>(
    `/admin/members/${encodeURIComponent(userId)}/ban`,
    { method: "DELETE", accessToken: token },
  );
}
