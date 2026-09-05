"use client";

import { useState, useTransition } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ActivityCard } from "@/components/activities/activity-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Activity, ActivityCategory } from "@/lib/activities/api";
import { loadActivitiesAction } from "@/lib/activities/actions";

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
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={upcoming ? "upcoming" : "past"} onValueChange={selectUpcoming}>
          <TabsList>
            <TabsTrigger value="upcoming">Akan datang</TabsTrigger>
            <TabsTrigger value="past">Aktiviti lepas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            type="button"
            size="sm"
            variant={!categoryId ? "secondary" : "ghost"}
            onClick={() => selectCategory()}
          >
            Semua
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              size="sm"
              variant={categoryId === category.id ? "secondary" : "ghost"}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {loading && activities.length === 0 ? <ActivityListSkeleton /> : null}

      {!loading && error ? (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat aktiviti</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button type="button" variant="outline" onClick={() => load({ upcoming, categoryId })}>
            <RefreshCwIcon />
            Cuba lagi
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && activities.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">Tiada aktiviti ditemui</p>
          <p className="text-sm text-muted-foreground">
            Cuba pilih kategori atau tab yang lain.
          </p>
        </div>
      ) : null}

      {activities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
        </div>
      ) : null}

      {cursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={loading} onClick={loadMore}>
            {loading ? "Memuat…" : "Muat lagi"}
          </Button>
        </div>
      ) : activities.length > 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">Anda sudah sampai ke hujung senarai.</p>
      ) : null}
    </section>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="grid gap-4 rounded-2xl border bg-card p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
