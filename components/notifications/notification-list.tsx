"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClockIcon,
  BellIcon,
  CalendarCheck2Icon,
  CheckCircle2Icon,
  CircleXIcon,
  Clock3Icon,
  DownloadIcon,
  HeartIcon,
  MessageCircleIcon,
  PersonStandingIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { AppNotification, NotificationPage } from "@/lib/notifications/api";
import {
  deleteNotificationAction,
  deleteReadNotificationsAction,
  deleteSelectedNotificationsAction,
  loadNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export function NotificationList({ initialPage }: { initialPage: NotificationPage }) {
  const router = useRouter();
  const [items, setItems] = useState(initialPage.notifications);
  const [nextCursor, setNextCursor] = useState(initialPage.next_cursor);
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const unread = items.some((item) => !item.read);

  const grouped = useMemo(() => groupByDate(items), [items]);

  function markRead(item: AppNotification) {
    if (item.read) return Promise.resolve(true);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    return markNotificationReadAction(item.id).then((result) => {
      if (!result.ok) {
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: false } : entry));
        toast.error(result.message);
        return false;
      }
      return true;
    });
  }

  function openNotification(item: AppNotification) {
    startTransition(async () => {
      await markRead(item);
      const destination = notificationDestination(item);
      if (destination) router.push(destination);
    });
  }

  function markAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      toast.success("Semua notifikasi ditanda sebagai dibaca.");
    });
  }

  function loadMore() {
    if (!nextCursor || pending) return;
    startTransition(async () => {
      const result = await loadNotificationsAction(nextCursor);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setItems((current) => [...current, ...result.data.notifications]);
      setNextCursor(result.data.next_cursor);
    });
  }

  function deleteOne(item: AppNotification) {
    return deleteNotificationAction(item.id).then((result) => {
      if (!result.ok) {
        toast.error(result.message);
        return false;
      }
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Notifikasi dipadam.");
      return true;
    });
  }

  async function deleteRead() {
    const result = await deleteReadNotificationsAction();
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    setItems((current) => current.filter((item) => !item.read));
    toast.success("Notifikasi yang telah dibaca dipadam.");
    return true;
  }

  async function deleteSelected() {
    const ids = [...selectedIds];
    const result = await deleteSelectedNotificationsAction(ids);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    setItems((current) => current.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} notifikasi dipadam.`);
    return true;
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllSelected(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          {items.length > 0 ? (
            <label className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={selectedIds.size === items.length}
                onCheckedChange={(checked) => toggleAllSelected(checked === true)}
                aria-label="Pilih semua notifikasi"
              />
              Pilih semua
            </label>
          ) : null}
          {selectedIds.size > 0 ? (
            <ConfirmationDialog
              title="Padam notifikasi terpilih?"
              description={`${selectedIds.size} notifikasi akan dipadam dan tindakan ini tidak boleh dibuat asal.`}
              confirmLabel="Padam dipilih"
              trigger={<Button type="button" variant="destructive" size="sm" disabled={pending}><Trash2Icon /> Padam dipilih ({selectedIds.size})</Button>}
              onConfirm={deleteSelected}
            />
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={!unread || pending} onClick={markAllRead}>
            <CheckCircle2Icon />
            Tanda semua dibaca
          </Button>
          {items.some((item) => item.read) ? (
            <ConfirmationDialog
              title="Padam semua yang telah dibaca?"
              description="Semua notifikasi yang telah dibaca akan dipadam dan tindakan ini tidak boleh dibuat asal."
              confirmLabel="Padam semua"
              trigger={<Button type="button" variant="outline" size="sm" disabled={pending}><Trash2Icon /> Padam dibaca</Button>}
              onConfirm={deleteRead}
            />
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="grid min-h-72 place-items-center gap-3 py-12 text-center">
            <BellIcon className="size-10 text-muted-foreground/60" />
            <div className="grid gap-1">
              <p className="font-medium">Tiada notifikasi buat masa ini.</p>
              <p className="text-sm text-muted-foreground">Kami akan maklumkan perkembangan baharu di sini.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="divide-y">
              {grouped.map((entry) => entry.kind === "heading" ? (
                <div key={entry.label} className="bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {entry.label}
                </div>
              ) : (
                <NotificationRow
                  key={entry.item.id}
                  item={entry.item}
                  disabled={pending}
                  onOpen={() => openNotification(entry.item)}
                  onDelete={() => deleteOne(entry.item)}
                  selected={selectedIds.has(entry.item.id)}
                  onSelectedChange={(checked) => toggleSelected(entry.item.id, checked)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {nextCursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={pending} onClick={loadMore}>
            {pending ? "Memuat…" : "Muat lagi"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  disabled,
  onOpen,
  onDelete,
  selected,
  onSelectedChange,
}: {
  item: AppNotification;
  disabled: boolean;
  onOpen: () => void;
  onDelete: () => Promise<boolean>;
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
}) {
  const actorDestination = isPersonTriggered(item) ? `/members/${encodeURIComponent(item.actor_id)}` : null;
  return (
    <div className={cn("flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40", !item.read && "bg-primary/[0.04]")}>
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelectedChange(checked === true)}
        aria-label="Pilih notifikasi"
        className="mt-1"
      />
      {actorDestination ? (
        <Link href={actorDestination} className="mt-0.5 rounded-full p-1 text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring" aria-label="Lihat profil pelaku">
          <NotificationIcon type={item.type} className="size-5" />
        </Link>
      ) : (
        <NotificationIcon type={item.type} className={cn("mt-1 size-5 shrink-0", notificationTone(item.type))} />
      )}
      <button type="button" className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={disabled} onClick={onOpen}>
        <span className={cn("block text-sm leading-6", !item.read && "font-semibold")}>{notificationTitle(item.type)}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3Icon className="size-3.5" />
          {relativeTime(item.created_at)}
        </span>
      </button>
      {!item.read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" /> : null}
      <ConfirmationDialog
        title="Padam notifikasi?"
        description="Notifikasi ini akan dipadam dan tindakan ini tidak boleh dibuat asal."
        confirmLabel="Padam"
        trigger={<Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" disabled={disabled} aria-label="Padam notifikasi"><Trash2Icon /></Button>}
        onConfirm={onDelete}
      />
    </div>
  );
}

type GroupedEntry =
  | { kind: "heading"; label: string }
  | { kind: "item"; item: AppNotification };

function groupByDate(items: AppNotification[]): GroupedEntry[] {
  let previous = "";
  const result: GroupedEntry[] = [];
  for (const item of items) {
    const label = dateBucket(item.created_at);
    if (label !== previous) {
      result.push({ kind: "heading", label });
      previous = label;
    }
    result.push({ kind: "item", item });
  }
  return result;
}

function dateBucket(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((day.getTime() - itemDay.getTime()) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Semalam";
  return "Lebih awal";
}

function relativeTime(value: string): string {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("ms", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

export function notificationTitle(type: string): string {
  const titles: Record<string, string> = {
    post_like: "Seseorang menyukai post anda",
    comment_like: "Seseorang menyukai komen anda",
    post_comment: "Seseorang comment pada post anda",
    member_pending: "Ahli baru menunggu kelulusan anda",
    member_approved: "Pendaftaran anda telah diluluskan.",
    member_rejected: "Pendaftaran anda tidak diluluskan.",
    activity_published: "Aktiviti baharu telah dibuka untuk pendaftaran.",
    activity_cancelled: "Satu aktiviti anda telah dibatalkan.",
    activity_reminder: "Peringatan: aktiviti anda bermula tidak lama lagi.",
    certificate_ready: "Sijil anda sudah sedia dimuat turun.",
  };
  return titles[type] ?? "Anda ada notifikasi baharu.";
}

function NotificationIcon({ type, className }: { type: string; className?: string }) {
  if (type === "post_like" || type === "comment_like") return <HeartIcon className={className} />;
  if (type === "post_comment") return <MessageCircleIcon className={className} />;
  if (type === "member_pending") return <UserPlusIcon className={className} />;
  if (type === "member_approved") return <CheckCircle2Icon className={className} />;
  if (type === "member_rejected" || type === "activity_cancelled") return <CircleXIcon className={className} />;
  if (type === "activity_published") return <CalendarCheck2Icon className={className} />;
  if (type === "activity_reminder") return <AlarmClockIcon className={className} />;
  if (type === "certificate_ready") return <DownloadIcon className={className} />;
  return <PersonStandingIcon className={className} />;
}

function notificationTone(type: string): string {
  if (type === "post_like" || type === "comment_like" || type === "member_rejected" || type === "activity_cancelled") {
    return "text-destructive";
  }
  return "text-primary";
}

function isPersonTriggered(item: AppNotification): boolean {
  return item.type === "post_like" || item.type === "comment_like" || item.type === "post_comment";
}

export function notificationDestination(item: AppNotification): string | null {
  if (item.post_id) return `/posts/${encodeURIComponent(item.post_id)}`;
  return null;
}
