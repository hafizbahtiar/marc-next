"use server";

import { revalidatePath } from "next/cache";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import type { Comment, Post, PostType } from "@/lib/api/types";
import { accessToken as bacaAccessToken } from "@/lib/auth/session";
import * as postsApi from "./api";
import type { HasilTindakan } from "./hasil";

async function token(): Promise<string> {
  const t = await bacaAccessToken();
  if (!t) throw new Error("Sesi tidak sah.");
  return t;
}

/** Ralat "tiada sesi" (lihat `token()`) - bukan `ApiError`, jadi dikesan berasingan. */
const MESEJ_SESI_TAK_SAH = "Sesi tidak sah.";

/** Tukar ralat lapisan API kepada mesej. Ralat tak dikenali dilempar semula. */
function ralatDaripada(error: unknown): string {
  if (error instanceof ApiError || error instanceof ApiUnreachableError) return error.message;
  if (error instanceof Error && error.message === MESEJ_SESI_TAK_SAH) {
    return "Sesi tamat. Sila log masuk semula.";
  }
  throw error;
}

export async function ciptaPosAction(body: {
  type?: PostType;
  content: string;
  r2_keys?: string[];
}): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.ciptaPos(await token(), body);
    revalidatePath("/posts");
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function kemaskiniPosAction(id: string, content: string): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.kemaskiniPos(await token(), id, content);
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function padamPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.padamPos(await token(), id);
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function sukaPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.sukaPos(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function nyahSukaPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.nyahSukaPos(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function ciptaKomenAction(
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<HasilTindakan<Comment>> {
  try {
    const comment = await postsApi.ciptaKomen(await token(), postId, content, parentCommentId);
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: comment };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function sukaKomenAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.sukaKomen(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function nyahSukaKomenAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.nyahSukaKomen(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function mintaUploadURLAction(
  contentType: string,
): Promise<HasilTindakan<{ upload_url: string; r2_key: string }>> {
  try {
    const hasil = await postsApi.mintaUploadURL(await token(), contentType);
    return { ok: true, data: hasil };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}
