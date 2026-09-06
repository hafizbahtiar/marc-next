"use server";

import { revalidatePath } from "next/cache";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import type { Comment, Post, PostType } from "@/lib/api/types";
import { accessToken as bacaAccessToken } from "@/lib/auth/session";
import * as postsApi from "./api";
import type { HasilTindakan } from "./result";

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

export async function createPostAction(body: {
  type?: PostType;
  content: string;
  r2_keys?: string[];
}): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.createPost(await token(), body);
    revalidatePath("/posts");
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function updatePostAction(id: string, content: string, updatedAt: string): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.updatePost(await token(), id, content, updatedAt);
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function deletePostAction(id: string, updatedAt: string): Promise<HasilTindakan> {
  try {
    await postsApi.deletePost(await token(), id, updatedAt);
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function likePostAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.likePost(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function unlikePostAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.unlikePost(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function createCommentAction(
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<HasilTindakan<Comment>> {
  try {
    const comment = await postsApi.createComment(await token(), postId, content, parentCommentId);
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: comment };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function likeCommentAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.likeComment(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function unlikeCommentAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.unlikeComment(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function updateCommentAction(
  postId: string,
  id: string,
  content: string,
  updatedAt: string,
): Promise<HasilTindakan<Comment>> {
  try {
    const comment = await postsApi.updateComment(await token(), id, content, updatedAt);
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: comment };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function deleteCommentAction(postId: string, id: string, updatedAt: string): Promise<HasilTindakan> {
  try {
    await postsApi.deleteComment(await token(), id, updatedAt);
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function requestUploadUrlAction(
  contentType: string,
): Promise<HasilTindakan<{ upload_url: string; r2_key: string }>> {
  try {
    const hasil = await postsApi.requestUploadUrl(await token(), contentType);
    return { ok: true, data: hasil };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}
