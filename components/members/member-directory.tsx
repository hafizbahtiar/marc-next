"use client";

import { useMemo, useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MemberRow } from "@/lib/api/types";

export function MemberDirectory({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string | null>(null);

  const departments = useMemo<[string, string][]>(
    () =>
      [...new Map<string, string>(
        members
          .filter((member) => member.department_code)
          .map((member) => [
            member.department_code as string,
            member.department_name ?? member.department_code as string,
          ]),
      )].sort((a, b) => a[1].localeCompare(b[1])),
    [members],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return members.filter((member) => {
      if (department && member.department_code !== department) return false;
      if (!normalized) return true;
      return [member.display_name, member.member_id, member.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized));
    });
  }, [department, members, query]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, emel, atau no. ahli"
            className="h-10 pl-9"
          />
        </div>
        {departments.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setDepartment(null)}
              className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                department === null ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Semua
            </button>
            {departments.map(([code, name]) => (
              <button
                type="button"
                key={code}
                onClick={() => setDepartment(code)}
                className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                  department === code ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {filtered.length > 0 ? (
          <div className="divide-y">
            {filtered.map((member) => <MemberRowView key={member.user_id} member={member} />)}
          </div>
        ) : (
          <div className="grid place-items-center gap-2 px-6 py-16 text-center">
            <UsersIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {members.length === 0 ? "Tiada ahli." : "Tiada ahli sepadan."}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} ahli dipaparkan</p>
    </div>
  );
}

function MemberRowView({ member }: { member: MemberRow }) {
  const name = member.display_name?.trim() || "(Tiada nama)";
  const initials = name.slice(0, 2).toUpperCase();
  const detail = [member.member_id ?? "Belum disahkan", member.department_name, member.position]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar className="size-10">
        {member.avatar_url ? <AvatarImage src={member.avatar_url} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
        {member.email ? <p className="truncate text-xs text-muted-foreground">{member.email}</p> : null}
      </div>
      {!member.is_active ? <Badge variant="destructive">Tidak aktif</Badge> : null}
      {member.category === "management" ? <Badge variant="secondary">{member.role_name}</Badge> : null}
    </div>
  );
}
