"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon, PencilIcon, ShieldBanIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { ResponsiveDetailsSheet } from "@/components/marc/responsive-sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/masked-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberRow } from "@/lib/api/types";
import type { AssignableDepartment, MemberRole } from "@/lib/members/api";
import {
  updateMemberActiveAction,
  updateMemberDepartmentAction,
  updateMemberRoleAction,
  correctMemberIdAction,
  correctStaffIdAction,
} from "@/lib/members/actions";
import { formatMemberIdInput } from "@/lib/members/member-id";
import { banMemberAction } from "@/lib/admin/member-bans-actions";

export function MemberActions({
  member,
  roleKey,
  roleRank,
  roles,
  departments,
}: {
  member: MemberRow;
  roleKey: string;
  roleRank: number;
  roles: MemberRole[];
  departments: AssignableDepartment[];
}) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(member.role_key);
  const [departmentCode, setDepartmentCode] = useState(member.department_code ?? "none");
  const [position, setPosition] = useState(member.position ?? "");
  const [staffId, setStaffId] = useState(member.staff_id ?? "");
  const [memberId, setMemberId] = useState(member.member_id ?? "");
  const name = member.display_name?.trim() || member.member_id || "ahli ini";
  const canEditRank = roleRank > member.role_rank;
  const canEditDepartment = ["manager", "admin", "superadmin"].includes(roleKey) && roleRank >= member.role_rank;
  const canCorrectIds = ["admin", "superadmin"].includes(roleKey) && roleRank > member.role_rank;
  const canBanMember = roleKey === "superadmin" && member.role_key !== "superadmin";

  async function updateRole() {
    const result = await updateMemberRoleAction(member.user_id, selectedRole, member.updated_at);
    toast[result.ok ? "success" : "error"](result.mesej);
    if (result.ok) router.refresh();
  }

  async function updateDepartment() {
    const result = await updateMemberDepartmentAction(
      member.user_id,
      departmentCode === "none" ? null : departmentCode,
      position.trim() || null,
      member.updated_at,
    );
    toast[result.ok ? "success" : "error"](result.mesej);
    if (result.ok) router.refresh();
  }

  async function correctStaffId() {
    const result = await correctStaffIdAction(member.user_id, staffId);
    toast[result.ok ? "success" : "error"](result.mesej);
    if (result.ok) router.refresh();
  }

  async function correctMemberId() {
    const result = await correctMemberIdAction(member.user_id, memberId);
    toast[result.ok ? "success" : "error"](result.mesej);
    if (result.ok) router.refresh();
  }

  return (
    <ResponsiveDetailsSheet
      title={`Tindakan ahli: ${name}`}
      description="Pilih tindakan yang ingin dilakukan untuk ahli ini."
      trigger={
        <Button size="sm" variant="outline">
          <MoreHorizontalIcon />
          Tindakan
        </Button>
      }
    >
      <div className="grid gap-2">
        <Button asChild variant="outline" className="justify-start">
          <Link href={`/members/${member.user_id}`}>
            <UserRoundIcon />
            Lihat profil ahli
          </Link>
        </Button>

        {canEditRank ? (
          <ConfirmationDialog
            title={member.is_active ? "Nyahaktifkan ahli?" : "Aktifkan ahli?"}
            description={`${member.is_active ? "Nyahaktifkan" : "Aktifkan"} ${name}. Status kelulusan pendaftaran tidak berubah.`}
            confirmLabel={member.is_active ? "Nyahaktifkan" : "Aktifkan"}
            trigger={
              <Button className="justify-start" variant={member.is_active ? "destructive" : "outline"}>
                <ShieldCheckIcon />
                {member.is_active ? "Nyahaktifkan ahli" : "Aktifkan ahli"}
              </Button>
            }
            onConfirm={async () => {
              const result = await updateMemberActiveAction(member.user_id, !member.is_active, member.updated_at);
              if (result.ok) router.refresh();
              else toast.error(result.mesej);
              return result.ok;
            }}
          />
        ) : null}

        {canBanMember ? <BanMemberDialog member={member} /> : null}

        {roles.length > 0 && canEditRank ? (
          <ResponsiveDetailsSheet
            title="Tukar role"
            description={`Kemas kini role untuk ${name}.`}
            trigger={<Button variant="outline" className="justify-start"><PencilIcon /> Tukar role</Button>}
          >
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void updateRole();
              }}
            >
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => <SelectItem key={role.key} value={role.key}>{role.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit"><PencilIcon /> Simpan role</Button>
            </form>
          </ResponsiveDetailsSheet>
        ) : null}

        {departments.length > 0 && canEditDepartment ? (
          <ResponsiveDetailsSheet
            title="Bahagian dan jawatan"
            description={`Kemas kini maklumat organisasi untuk ${name}.`}
            trigger={<Button variant="outline" className="justify-start"><PencilIcon /> Bahagian dan jawatan</Button>}
          >
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void updateDepartment();
              }}
            >
              <div className="grid gap-2">
                <Label>Bahagian</Label>
                <Select value={departmentCode} onValueChange={setDepartmentCode}>
                  <SelectTrigger><SelectValue placeholder="Pilih bahagian" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tiada bahagian</SelectItem>
                    {departments.map((department) => <SelectItem key={department.code} value={department.code}>{department.code} - {department.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`position-${member.user_id}`}>Jawatan</Label>
                <Input id={`position-${member.user_id}`} value={position} onChange={(event) => setPosition(event.target.value)} maxLength={150} placeholder="Contoh: Penolong Pegawai" />
              </div>
              <Button type="submit"><PencilIcon /> Simpan bahagian</Button>
            </form>
          </ResponsiveDetailsSheet>
        ) : null}

      {canCorrectIds ? (
        <>
          <ResponsiveDetailsSheet
            title="Betulkan nombor staff"
            description={`Nombor staff untuk ${name}.`}
            trigger={<Button variant="outline" className="justify-start"><PencilIcon /> ID staff</Button>}
          >
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void correctStaffId(); }}>
              <div className="grid gap-2">
                <Label htmlFor={`staff-id-${member.user_id}`}>Nombor staff</Label>
                <Input id={`staff-id-${member.user_id}`} value={staffId} onChange={(event) => setStaffId(event.target.value)} maxLength={64} required />
                <p className="text-xs text-muted-foreground">Maksimum 64 aksara dan tidak boleh mengandungi `/`.</p>
              </div>
              <Button type="submit" disabled={!staffId.trim()}><PencilIcon /> Simpan ID staff</Button>
            </form>
          </ResponsiveDetailsSheet>
          {member.member_id ? (
            <ResponsiveDetailsSheet
              title="Betulkan nombor ahli"
              description={`Nombor ahli untuk ${name}.`}
              trigger={<Button variant="outline" className="justify-start"><PencilIcon /> ID ahli</Button>}
            >
              <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void correctMemberId(); }}>
                <div className="grid gap-2">
                  <Label htmlFor={`member-id-${member.user_id}`}>Nombor ahli</Label>
                  <MaskedInput
                    id={`member-id-${member.user_id}`}
                    value={memberId}
                    formatValue={formatMemberIdInput}
                    onValueChange={setMemberId}
                    maxLength={128}
                    placeholder="MARC-AB1C/2026-SA"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format baharu: MARC-{`{staff}`}/2026-{`{kod}`}. Format lama akan dikekalkan.
                  </p>
                </div>
                <Button type="submit" disabled={!memberId.trim()}><PencilIcon /> Simpan ID ahli</Button>
              </form>
            </ResponsiveDetailsSheet>
          ) : null}
        </>
      ) : null}
      </div>
    </ResponsiveDetailsSheet>
  );
}

function BanMemberDialog({ member }: { member: MemberRow }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"permanent" | "temporary">("temporary");
  const [expiresAt, setExpiresAt] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const canSubmit = reason.trim().length > 0 && (mode === "permanent" || expiresAt !== "");

  async function submit() {
    if (!canSubmit) return;
    setPending(true);
    const result = await banMemberAction(
      member.user_id,
      reason.trim(),
      mode === "temporary" ? new Date(expiresAt).toISOString() : undefined,
    );
    setPending(false);
    if (result.ok) {
      setOpen(false);
      setReason("");
      setExpiresAt("");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="justify-start"><ShieldBanIcon /> Gantung akaun</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gantung akaun?</AlertDialogTitle>
          <AlertDialogDescription>
            {member.email ?? "Akaun ahli"} tidak akan boleh mengakses MARC sepanjang tempoh penggantungan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Jenis penggantungan</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as "permanent" | "temporary")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Tidak permanent</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === "temporary" ? (
            <div className="grid gap-2">
              <Label htmlFor={`ban-expires-${member.user_id}`}>Tamat pada</Label>
              <Input id={`ban-expires-${member.user_id}`} type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor={`ban-reason-${member.user_id}`}>Sebab</Label>
            <Input id={`ban-reason-${member.user_id}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={!canSubmit || pending} onClick={(event) => { event.preventDefault(); void submit(); }}>
            {pending ? "Memproses…" : "Gantung akaun"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
