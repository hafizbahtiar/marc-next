import "server-only";

import { apiFetch } from "@/lib/api/client";
import type {
  Comment,
  Post,
  PostType,
  SenaraiKomenRespons,
  SenaraiPosRespons,
} from "@/lib/api/types";

/**
 * Pembalut nipis atas laluan `/posts`, `/comments` dan `/uploads/presign`
 * backend Go - padanan `lib/auth/api.ts` untuk domain post/feed.
 */

export function listPosts(
  accessToken: string,
  cursor?: string,
  limit = 20,
): Promise<SenaraiPosRespons> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return apiFetch<SenaraiPosRespons>(`/posts?${params.toString()}`, { accessToken });
}

export function getPost(accessToken: string, id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { accessToken });
}

export function createPost(
  accessToken: string,
  body: { type?: PostType; content: string; r2_keys?: string[] },
): Promise<Post> {
  return apiFetch<Post>("/posts", { method: "POST", body, accessToken });
}

export function updatePost(accessToken: string, id: string, content: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { method: "PATCH", body: { content }, accessToken });
}

export function deletePost(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}`, { method: "DELETE", accessToken });
}

export function likePost(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/like`, { method: "POST", accessToken });
}

export function unlikePost(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/like`, { method: "DELETE", accessToken });
}

export function listComments(accessToken: string, postId: string): Promise<SenaraiKomenRespons> {
  return apiFetch<SenaraiKomenRespons>(`/posts/${postId}/comments`, { accessToken });
}

export function createComment(
  accessToken: string,
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<Comment> {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: parentCommentId ? { content, parent_comment_id: parentCommentId } : { content },
    accessToken,
  });
}

export function likeComment(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/comments/${id}/like`, { method: "POST", accessToken });
}

export function unlikeComment(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/comments/${id}/like`, { method: "DELETE", accessToken });
}

export function updateComment(accessToken: string, id: string, content: string): Promise<Comment> {
  return apiFetch<Comment>(`/comments/${id}`, {
    method: "PATCH",
    body: { content },
    accessToken,
  });
}

export function deleteComment(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/comments/${id}`, { method: "DELETE", accessToken });
}

export function requestUploadUrl(
  accessToken: string,
  contentType: string,
): Promise<{ upload_url: string; r2_key: string }> {
  return apiFetch<{ upload_url: string; r2_key: string }>("/uploads/presign", {
    method: "POST",
    body: { content_type: contentType },
    accessToken,
  });
}
