"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";

import {
  cancelActivity,
  cancelManagedActivity,
  checkoutActivity,
  createManagedActivity,
  getCertificateFile,
  listActivityRegistrants,
  listActivities,
  markAttendance,
  publishManagedActivity,
  replaceActivitySessions,
  registerActivity,
  issueCertificates,
  scanAttendanceByToken,
  selfCheckIn,
  unmarkAttendance,
  updateManagedActivity,
} from "./api";
import type {
  ActivityInput,
  ActivityListResponse,
  ActivityRegistrant,
  ActivitySessionInput,
  Activity,
  IssueCertificatesResponse,
  RegistrationResponse,
} from "./api";

export type ActivityActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function getToken(): Promise<string> {
  const token = await accessToken();
  if (!token) throw new Error("Sesi anda sudah tamat.");
  return token;
}

function actionError(error: unknown): { error: string; code?: string } {
  if (error instanceof ApiError) {
    if (error.message.includes("telefon")) return { error: error.message, code: "phone_required" };
    if (error.status === 404) return { error: error.message, code: "not_found" };
    if (error.status === 422) return { error: error.message, code: "outside_window" };
    if (error.status === 409) return { error: error.message, code: "conflict" };
    if (error.status === 410) return { error: messageOrFallback(error.message, "Sijil ini sudah tidak tersedia."), code: "gone" };
    return { error: error.message };
  }
  if (error instanceof Error && error.message === "Sesi anda sudah tamat.") {
    return { error: error.message };
  }
  return { error: "Sesuatu tidak kena. Cuba lagi." };
}

function messageOrFallback(message: string, fallback: string): string {
  return message || fallback;
}

export async function registerActivityAction(id: string): Promise<ActivityActionResult<RegistrationResponse>> {
  try {
    const data = await registerActivity(await getToken(), id);
    revalidatePath("/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath("/my-activities");
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function loadActivitiesAction(options: {
  upcoming: boolean;
  categoryId?: string;
  cursor?: string;
}): Promise<ActivityActionResult<ActivityListResponse>> {
  try {
    const data = await listActivities(await getToken(), options);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function cancelActivityAction(id: string): Promise<ActivityActionResult<RegistrationResponse>> {
  try {
    const data = await cancelActivity(await getToken(), id);
    revalidatePath("/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath("/my-activities");
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function checkoutActivityAction(
  id: string,
  phone?: string,
): Promise<ActivityActionResult<{ redirect_url: string }>> {
  try {
    const data = await checkoutActivity(await getToken(), id, phone);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function getCertificateFileAction(
  id: string,
): Promise<ActivityActionResult<{ url: string }>> {
  try {
    const data = await getCertificateFile(await getToken(), id);
    if (!data.url.startsWith("https://")) {
      return { ok: false, error: "Pautan sijil tidak sah." };
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function createManagedActivityAction(
  body: ActivityInput & { sessions: ActivitySessionInput[] },
): Promise<ActivityActionResult<Activity>> {
  try {
    const data = await createManagedActivity(await getToken(), body);
    revalidatePath("/activities");
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function updateManagedActivityAction(
  id: string,
  body: Partial<ActivityInput>,
): Promise<ActivityActionResult<Activity>> {
  try {
    const data = await updateManagedActivity(await getToken(), id, body);
    revalidatePath("/activities");
    revalidatePath(`/activities/${id}`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function replaceActivitySessionsAction(
  id: string,
  sessions: ActivitySessionInput[],
): Promise<ActivityActionResult<Activity>> {
  try {
    const data = await replaceActivitySessions(await getToken(), id, sessions);
    revalidatePath(`/activities/${id}`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function publishManagedActivityAction(id: string): Promise<ActivityActionResult<Activity>> {
  try {
    const data = await publishManagedActivity(await getToken(), id);
    revalidatePath("/activities");
    revalidatePath(`/activities/${id}`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function cancelManagedActivityAction(
  id: string,
  reason: string,
): Promise<ActivityActionResult<Activity>> {
  try {
    const data = await cancelManagedActivity(await getToken(), id, reason);
    revalidatePath("/activities");
    revalidatePath(`/activities/${id}`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function listActivityRegistrantsAction(
  id: string,
): Promise<ActivityActionResult<ActivityRegistrant[]>> {
  try {
    const data = await listActivityRegistrants(await getToken(), id);
    return { ok: true, data: data.registrations };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function markAttendanceAction(
  activityId: string,
  sessionId: string,
  registrationId: string,
  amendReason?: string,
): Promise<ActivityActionResult<{ created: boolean }>> {
  try {
    const data = await markAttendance(await getToken(), activityId, sessionId, registrationId, amendReason);
    revalidatePath(`/activities/${activityId}/registrations`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function unmarkAttendanceAction(
  activityId: string,
  sessionId: string,
  registrationId: string,
): Promise<ActivityActionResult<{ deleted: boolean }>> {
  try {
    const data = await unmarkAttendance(await getToken(), activityId, sessionId, registrationId);
    revalidatePath(`/activities/${activityId}/registrations`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function selfCheckInAction(
  activityId: string,
  sessionId: string,
): Promise<ActivityActionResult<{ created: boolean }>> {
  try {
    const data = await selfCheckIn(await getToken(), activityId, sessionId);
    revalidatePath("/my-activities");
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function scanAttendanceByTokenAction(
  activityId: string,
  sessionId: string,
  checkinToken: string,
): Promise<ActivityActionResult<{ created: boolean; member?: { display_name?: string; member_id?: string } }>> {
  try {
    const data = await scanAttendanceByToken(await getToken(), activityId, sessionId, checkinToken);
    revalidatePath(`/activities/${activityId}/registrations`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}

export async function issueCertificatesAction(
  activityId: string,
): Promise<ActivityActionResult<IssueCertificatesResponse>> {
  try {
    const data = await issueCertificates(await getToken(), activityId);
    revalidatePath(`/activities/${activityId}`);
    revalidatePath(`/activities/${activityId}/certificates`);
    revalidatePath("/my-certificates");
    return { ok: true, data };
  } catch (error) {
    return { ok: false, ...actionError(error) };
  }
}
