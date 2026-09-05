import "server-only";

import { apiFetch } from "@/lib/api/client";

export type AuditLog = {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  actor_member_id: string | null;
  actor_role_key: string | null;
  changed_fields: string[];
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};

export function listAuditLogs(accessToken: string): Promise<{ logs: AuditLog[] }> {
  return apiFetch<{ logs: AuditLog[] }>("/audit-logs?limit=50", { accessToken });
}
