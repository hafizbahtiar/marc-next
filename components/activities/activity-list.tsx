"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { RefreshCwIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, DataTableColumnHeader } from "@/components/marc/data-table";
import type { Activity, ActivityCategory } from "@/lib/activities/api";
import { loadActivitiesAction } from "@/lib/activities/actions";
import { activityStatusLabel, formatActivityDateTime, formatCurrency } from "@/lib/activities/helpers";

const activityColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aktiviti" />,
    cell: ({ row }) => (
      <div className="grid min-w-52 gap-1">
        <Link
          href={`/activities/${encodeURIComponent(row.original.id)}`}
          className="font-medium hover:text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.original.title}
        </Link>
        <span className="text-xs text-muted-foreground">{row.original.category_name || "Tanpa kategori"}</span>
      </div>
    ),
  },
  {
    accessorKey: "starts_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tarikh" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">{formatActivityDateTime(row.original.starts_at)}</span>
    ),
  },
  {
    accessorKey: "location_name",
    header: "Lokasi",
    cell: ({ row }) => (
      <span className="block max-w-44 truncate text-sm text-muted-foreground">
        {row.original.location_name || "Akan diumumkan"}
      </span>
    ),
  },
  {
    accessorKey: "registration_count",
    header: "Peserta",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {row.original.capacity === null
          ? `${row.original.registration_count}`
          : `${row.original.registration_count}/${row.original.capacity}`}
      </span>
    ),
  },
  {
    accessorKey: "fee_cents",
    header: "Yuran",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {row.original.fee_cents > 0 ? formatCurrency(row.original.fee_cents, row.original.currency) : "Percuma"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant={row.original.status === "cancelled" ? "destructive" : "secondary"}>
          {activityStatusLabel(row.original.status)}
        </Badge>
        {row.original.is_registered ? <Badge variant="outline">Berdaftar</Badge> : null}
      </div>
    ),
  },
];

export function ActivityList({
  initialActivities,
  initialCursor,
  categories,
}: {
  initialActivities: Activity[];
  initialCursor: string | null;
  categories: ActivityCategory[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [cursor, setCursor] = useState(initialCursor);
  const [upcoming, setUpcoming] = useState(true);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function load(options: { upcoming: boolean; categoryId?: string; cursor?: string; append?: boolean }) {
    startTransition(async () => {
      setError(null);
      const result = await loadActivitiesAction(options);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setActivities((current) => options.append ? [...current, ...result.data.activities] : result.data.activities);
      setCursor(result.data.next_cursor);
    });
  }

  function selectUpcoming(value: string) {
    const nextUpcoming = value === "upcoming";
    setUpcoming(nextUpcoming);
    setCursor(null);
    load({ upcoming: nextUpcoming, categoryId });
  }

  function selectCategory(nextCategoryId?: string) {
    setCategoryId(nextCategoryId);
    setCursor(null);
    load({ upcoming, categoryId: nextCategoryId });
  }

  function loadMore() {
    if (!cursor || loading) return;
    load({ upcoming, categoryId, cursor, append: true });
  }

  return (
    <section className="grid gap-5" aria-label="Senarai aktiviti">
      <div className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={upcoming ? "upcoming" : "past"} onValueChange={selectUpcoming}>
          <TabsList>
            <TabsTrigger value="upcoming">Akan datang</TabsTrigger>
            <TabsTrigger value="past">Aktiviti lepas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="min-w-0 sm:ml-auto">
          <Combobox
            items={["Semua kategori", ...categories.map((category) => category.name)]}
            value={categoryId ? categories.find((category) => category.id === categoryId)?.name : "Semua kategori"}
            onValueChange={(value) => {
              const category = categories.find((item) => item.name === value);
              selectCategory(category?.id);
            }}
          >
            <ComboboxInput
              placeholder="Pilih kategori…"
              showTrigger
              className="w-full sm:w-56"
            />
            <ComboboxContent>
              <ComboboxEmpty>Tiada kategori ditemui.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <DataTable
        columns={activityColumns}
        data={activities}
        isLoading={loading && activities.length === 0}
        error={error}
        onRetry={() => load({ upcoming, categoryId })}
        emptyMessage="Tiada aktiviti ditemui. Cuba pilih tab atau kategori yang lain."
        enablePagination={false}
        className="min-w-0"
      />

      {cursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={loading} onClick={loadMore}>
            <RefreshCwIcon className={loading ? "animate-spin" : undefined} />
            {loading ? "Memuat…" : "Muat lagi"}
          </Button>
        </div>
      ) : activities.length > 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">Anda sudah sampai ke hujung senarai.</p>
      ) : null}
    </section>
  );
}
