"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/notifications/api";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications/actions";
import { notificationDestination, notificationTitle } from "./notification-list";

export function NotificationPreview({
  items,
  unreadCount,
}: {
  items?: AppNotification[];
  unreadCount: number;
}) {
  const [previewItems, setPreviewItems] = useState(items ?? []);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function markAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setPreviewItems((current) => current.map((item) => ({ ...item, read: true })));
      toast.success("Semua notifikasi ditanda sebagai dibaca.");
    });
  }

  function open(item: AppNotification) {
    startTransition(async () => {
      if (!item.read) {
        const result = await markNotificationReadAction(item.id);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setPreviewItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
      }
      const destination = notificationDestination(item);
      setPopoverOpen(false);
      setDrawerOpen(false);
      if (destination) router.push(destination);
    });
  }

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative rounded-full text-muted-foreground hover:text-foreground"
      aria-label={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Notifikasi"}
    >
      <BellIcon className="size-5" />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 grid min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-3 text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );

  const content = (
    <NotificationPreviewContent
      items={previewItems}
      pending={pending}
      onOpen={open}
      onMarkAllRead={markAllRead}
      onClose={() => {
        setPopoverOpen(false);
        setDrawerOpen(false);
      }}
    />
  );

  return (
    <>
      <div className="hidden md:block">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
            <PopoverHeader className="border-b px-4 py-3">
              <PopoverTitle>Notifikasi</PopoverTitle>
              <PopoverDescription>Makluman terkini untuk akaun anda.</PopoverDescription>
            </PopoverHeader>
            {content}
          </PopoverContent>
        </Popover>
      </div>
      <div className="md:hidden">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Notifikasi</DrawerTitle>
              <DrawerDescription>Makluman terkini untuk akaun anda.</DrawerDescription>
            </DrawerHeader>
            {content}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

function NotificationPreviewContent({
  items,
  pending,
  onOpen,
  onMarkAllRead,
  onClose,
}: {
  items: AppNotification[];
  pending: boolean;
  onOpen: (item: AppNotification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const preview = items.slice(0, 7);
  return (
    <div className="grid gap-2 p-2">
      <div className="max-h-80 overflow-y-auto">
        {preview.length > 0 ? preview.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn("flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted", !item.read && "bg-primary/[0.06]")}
            disabled={pending}
            onClick={() => onOpen(item)}
          >
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.read ? "bg-muted" : "bg-primary")} />
            <span className="min-w-0 flex-1 text-sm leading-5">{notificationTitle(item.type)}</span>
          </button>
        )) : (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">Tiada notifikasi buat masa ini.</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <Button type="button" variant="ghost" size="sm" disabled={pending || !items.some((item) => !item.read)} onClick={onMarkAllRead}>
          <CheckIcon /> Dibaca semua
        </Button>
        <Button asChild type="button" variant="ghost" size="sm">
          <Link href="/notifications" onClick={onClose}>
            Lihat semua <ChevronRightIcon />
          </Link>
        </Button>
      </div>
    </div>
  );
}
