import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300",
  neutral: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", toneClasses[tone], className)}>
      <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function statusTone(status: string): StatusTone {
  if (["active", "aktif", "succeeded", "paid", "verified", "approved", "create"].includes(status)) return "success";
  if (["pending", "menunggu", "processing", "unverified"].includes(status)) return "warning";
  if (["failed", "inactive", "tidak aktif", "rejected", "delete"].includes(status)) return "danger";
  if (["update", "info"].includes(status)) return "info";
  return "neutral";
}
