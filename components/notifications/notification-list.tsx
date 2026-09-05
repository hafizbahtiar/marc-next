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
  UserPlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { AppNotification, NotificationPage } from "@/lib/notifications/api";
import {
  loadNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotificationList({ initialPage }: { initialPage: NotificationPage }) {
  const router = useRouter();
  const [items, setItems] = useState(initialPage.notifications);
  const [nextCursor, setNextCursor] = useState(initialPage.next_cursor);
  const [pending, startTransition] = useTransition();
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

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={!unread || pending} onClick={markAllRead}>
          <CheckCircle2Icon />
          Tanda semua dibaca
        </Button>
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
}: {
  item: AppNotification;
  disabled: boolean;
  onOpen: () => void;
}) {
  const actorDestination = isPersonTriggered(item) ? `/members/${encodeURIComponent(item.actor_id)}` : null;
  return (
    <div className={cn("flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40", !item.read && "bg-primary/[0.04]")}>
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

function notificationTitle(type: string): string {
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

function notificationDestination(item: AppNotification): string | null {
  if (item.post_id) return `/posts/${encodeURIComponent(item.post_id)}`;
  return null;
}
