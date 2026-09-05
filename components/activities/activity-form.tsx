"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Activity, ActivityCategory, ActivityInput, ActivitySessionInput } from "@/lib/activities/api";
import {
  cancelManagedActivityAction,
  createManagedActivityAction,
  publishManagedActivityAction,
  replaceActivitySessionsAction,
  updateManagedActivityAction,
} from "@/lib/activities/actions";

type SessionDraft = ActivitySessionInput & { key: string };

export function ActivityForm({
  categories,
  activity,
}: {
  categories: ActivityCategory[];
  activity?: Activity;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [categoryId, setCategoryId] = useState(activity?.category_id ?? "");
  const [locationName, setLocationName] = useState(activity?.location_name ?? "");
  const [locationAddress, setLocationAddress] = useState(activity?.location_address ?? "");
  const [opensAt, setOpensAt] = useState(toInputDate(activity?.registration_opens_at));
  const [closesAt, setClosesAt] = useState(toInputDate(activity?.registration_closes_at));
  const [capacity, setCapacity] = useState(activity?.capacity?.toString() ?? "");
  const [fee, setFee] = useState(activity ? String(activity.fee_cents / 100) : "0");
  const [threshold, setThreshold] = useState(String(activity?.attendance_threshold_pct ?? 100));
  const [sessions, setSessions] = useState<SessionDraft[]>(() =>
    activity?.sessions.length
      ? activity.sessions.map((session) => ({
          key: session.id,
          seq: session.seq,
          title: session.title,
          starts_at: toInputDate(session.starts_at),
          ends_at: toInputDate(session.ends_at),
        }))
      : [newSession()],
  );
  const [cancelReason, setCancelReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateSession(key: string, patch: Partial<SessionDraft>) {
    setSessions((current) => current.map((session) => session.key === key ? { ...session, ...patch } : session));
  }

  function submit() {
    const payload = buildPayload({
      categoryId, title, description, locationName, locationAddress, opensAt, closesAt,
      capacity, fee, threshold, sessions,
    });
    if (!payload.ok) {
      setFormError(payload.error);
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const result = activity
        ? await updateManagedActivityAction(activity.id, payload.data)
        : await createManagedActivityAction(payload.data);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      if (activity && JSON.stringify(activity.sessions.map(toSessionInput)) !== JSON.stringify(sessions.map(({ key: _key, ...session }) => session))) {
        const sessionsResult = await replaceActivitySessionsAction(activity.id, sessions.map(({ key: _key, ...session }) => session));
        if (!sessionsResult.ok) {
          setFormError(`Maklumat aktiviti disimpan, tetapi sesi gagal: ${sessionsResult.error}`);
          return;
        }
      }
      toast.success(activity ? "Aktiviti dikemas kini." : "Aktiviti dicipta sebagai draf.");
      router.push(activity ? `/activities/${activity.id}` : "/activities");
      router.refresh();
    });
  }

  function publish() {
    if (!activity) return;
    startTransition(async () => {
      const result = await publishManagedActivityAction(activity.id);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast.success("Aktiviti diterbitkan.");
      router.push(`/activities/${activity.id}`);
      router.refresh();
    });
  }

  function cancel() {
    if (!activity || !cancelReason.trim()) {
      setFormError("Sebab pembatalan diperlukan.");
      return;
    }
    startTransition(async () => {
      const result = await cancelManagedActivityAction(activity.id, cancelReason.trim());
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast.success("Aktiviti dibatalkan.");
      router.push(`/activities/${activity.id}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6">
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Semakan diperlukan</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="grid gap-2">
          <label htmlFor="activity-title" className="text-sm font-medium">Tajuk</label>
          <Input id="activity-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} />
        </div>
        <div className="grid gap-2">
          <label htmlFor="activity-category" className="text-sm font-medium">Kategori</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="activity-category"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
            <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="activity-description" className="text-sm font-medium">Penerangan</label>
          <Textarea id="activity-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} className="min-h-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="location-name" label="Nama lokasi" value={locationName} onChange={setLocationName} />
          <Field id="location-address" label="Alamat lokasi" value={locationAddress} onChange={setLocationAddress} />
          <Field id="registration-opens" label="Pendaftaran dibuka" type="datetime-local" value={opensAt} onChange={setOpensAt} />
          <Field id="registration-closes" label="Pendaftaran ditutup" type="datetime-local" value={closesAt} onChange={setClosesAt} required />
          <Field id="capacity" label="Kapasiti (kosong = tiada had)" type="number" min="1" value={capacity} onChange={setCapacity} />
          <Field id="fee" label="Yuran (RM)" type="number" min="0" step="0.01" value={fee} onChange={setFee} />
          <Field id="threshold" label="Ambang kehadiran (%)" type="number" min="1" max="100" value={threshold} onChange={setThreshold} />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="font-heading text-lg font-semibold">Sesi aktiviti</h2><p className="text-sm text-muted-foreground">Tambah sekurang-kurangnya satu sesi.</p></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setSessions((current) => [...current, newSession()])}><PlusIcon />Tambah sesi</Button>
        </div>
        {sessions.map((session, index) => (
          <div key={session.key} className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <Field id={`session-title-${session.key}`} label={`Sesi ${index + 1}`} value={session.title} onChange={(value) => updateSession(session.key, { title: value })} />
            <Field id={`session-start-${session.key}`} label="Mula" type="datetime-local" value={session.starts_at} onChange={(value) => updateSession(session.key, { starts_at: value })} />
            <Field id={`session-end-${session.key}`} label="Tamat" type="datetime-local" value={session.ends_at} onChange={(value) => updateSession(session.key, { ends_at: value })} />
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Buang sesi" disabled={sessions.length === 1} onClick={() => setSessions((current) => current.filter((item) => item.key !== session.key))}><Trash2Icon /></Button>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
        <Button type="button" onClick={submit} disabled={pending}>{pending ? "Menyimpan…" : "Simpan aktiviti"}</Button>
      </div>

      {activity?.status === "draft" ? (
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div><p className="font-medium">Aktiviti ini masih draf</p><p className="text-sm text-muted-foreground">Terbitkan selepas semua maklumat lengkap.</p></div>
          <Button type="button" onClick={publish} disabled={pending}>Terbitkan aktiviti</Button>
        </div>
      ) : null}
      {activity && activity.status !== "cancelled" && activity.status !== "completed" ? (
        <div className="grid gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-2"><label htmlFor="cancel-reason" className="text-sm font-medium">Sebab pembatalan</label><Input id="cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Contoh: lokasi tidak tersedia" maxLength={500} /></div>
          <Button type="button" variant="destructive" onClick={cancel} disabled={pending || !cancelReason.trim()}>Batalkan aktiviti</Button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", ...props }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; [key: string]: unknown }) {
  return <div className="grid gap-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></div>;
}

function newSession(): SessionDraft {
  const start = new Date(Date.now() + 7 * 86400000);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 3 * 3600000);
  return { key: crypto.randomUUID(), seq: 1, title: "", starts_at: toInputDate(start.toISOString()), ends_at: toInputDate(end.toISOString()) };
}

function toInputDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function toSessionInput(session: ActivitySessionInput): ActivitySessionInput {
  return { ...session, starts_at: new Date(session.starts_at).toISOString(), ends_at: new Date(session.ends_at).toISOString() };
}

function buildPayload(values: {
  categoryId: string; title: string; description: string; locationName: string; locationAddress: string;
  opensAt: string; closesAt: string; capacity: string; fee: string; threshold: string; sessions: SessionDraft[];
}): { ok: true; data: ActivityInput & { sessions: ActivitySessionInput[] } } | { ok: false; error: string } {
  if (!values.categoryId || !values.title.trim() || !values.locationName.trim() || !values.closesAt) return { ok: false, error: "Lengkapkan kategori, tajuk, lokasi dan tarikh tutup pendaftaran." };
  if (!values.sessions.length || values.sessions.some((session) => !session.starts_at || !session.ends_at || new Date(session.ends_at) <= new Date(session.starts_at))) return { ok: false, error: "Pastikan sesi mempunyai masa mula dan tamat yang sah." };
  const fee = Number(values.fee);
  const threshold = Number(values.threshold);
  if (!Number.isFinite(fee) || fee < 0 || !Number.isInteger(threshold) || threshold < 1 || threshold > 100) return { ok: false, error: "Yuran atau ambang kehadiran tidak sah." };
  return { ok: true, data: {
    category_id: values.categoryId, title: values.title.trim(), description: values.description.trim(),
    location_name: values.locationName.trim(), location_address: values.locationAddress.trim(),
    registration_opens_at: values.opensAt ? new Date(values.opensAt).toISOString() : null,
    registration_closes_at: new Date(values.closesAt).toISOString(), capacity: values.capacity ? Number(values.capacity) : null,
    fee_cents: Math.round(fee * 100), attendance_threshold_pct: threshold,
    sessions: values.sessions.map(({ key: _key, seq: _seq, ...session }, index) => ({ ...session, seq: index + 1, starts_at: new Date(session.starts_at).toISOString(), ends_at: new Date(session.ends_at).toISOString() })),
  }};
}
