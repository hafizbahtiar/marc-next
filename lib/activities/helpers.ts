import type { Activity, MyRegistration } from "./api";

export type RegistrationBlocker =
  | "cancelled"
  | "completed"
  | "not_published"
  | "opens_later"
  | "closed"
  | "full";

export function getRegistrationBlocker(
  activity: Activity,
  now = new Date(),
): RegistrationBlocker | null {
  if (activity.status === "cancelled") return "cancelled";
  if (activity.status === "completed") return "completed";
  if (activity.status !== "published") return "not_published";
  if (activity.registration_opens_at && now < new Date(activity.registration_opens_at)) {
    return "opens_later";
  }
  if (now > new Date(activity.registration_closes_at)) return "closed";
  if (activity.capacity !== null && activity.registration_count >= activity.capacity) return "full";
  return null;
}

export function canRegister(activity: Activity, now = new Date()): boolean {
  return !activity.is_registered && getRegistrationBlocker(activity, now) === null;
}

export function registrationBlockerLabel(blocker: RegistrationBlocker | null): string | null {
  const labels: Record<RegistrationBlocker, string> = {
    cancelled: "Aktiviti ini telah dibatalkan.",
    completed: "Aktiviti ini telah tamat.",
    not_published: "Aktiviti ini belum dibuka.",
    opens_later: "Pendaftaran belum dibuka.",
    closed: "Pendaftaran telah ditutup.",
    full: "Aktiviti ini sudah penuh.",
  };
  return blocker ? labels[blocker] : null;
}

export function formatCurrency(cents: number | null, currency = "myr"): string {
  if (cents === null) return "Jumlah tidak diketahui";
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatActivityDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
    ...options,
  }).format(date);
}

export function formatActivityDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}

export function isRegistrationDone(registration: MyRegistration, now = new Date()): boolean {
  return registration.activity_status === "completed" || now > new Date(registration.ends_at);
}

export function groupRegistrations(registrations: MyRegistration[], now = new Date()) {
  const upcoming = registrations
    .filter((registration) => !isRegistrationDone(registration, now))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = registrations
    .filter((registration) => isRegistrationDone(registration, now))
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  return { upcoming, past };
}

export function activityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    published: "Diterbitkan",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    draft: "Draf",
  };
  return labels[status] ?? status;
}
