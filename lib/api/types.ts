/**
 * Bentuk respons backend Go. Nama medan mengikut tag JSON Go secara
 * verbatim (snake_case) - TIADA penukaran ke camelCase, supaya carian
 * rentas repo untuk medan seperti `registration_payment_status` menemui
 * kedua-dua belah sempadan.
 */

/** POST /auth/login, /auth/register, /auth/refresh. */
export type TokenPair = {
  access_token: string;
  refresh_token: string;
  /** Hayat access token dalam SAAT (bukan milisaat). */
  expires_in: number;
};

/** Status kelulusan keahlian - `profiles.status` di backend. */
export type MemberStatus = "pending" | "approved" | "rejected";

/** GET /me - lihat profileResponse, internal/http/handlers/profile.go. */
export type Profile = {
  member_id: string | null;
  email: string;
  email_verified: boolean;
  status: MemberStatus;
  display_name: string | null;
  phone: string | null;
  role_key: string;
  role_name: string;
  category: string;
  role_rank: number;
  avatar_url: string | null;
  /** Hanya diisi bila status !== "approved". */
  registration_payment_status: string | null;
  registration_fee_cents: number | null;
  telegram_linked: boolean;
  telegram_username: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  health_notes: string | null;
  is_active: boolean;
  department_code: string | null;
  department_name: string | null;
  position: string | null;
  staff_id: string;
  staff_id_verified_at: string | null;
  updated_at: string;
};

/** GET /members - directory row returned according to caller visibility. */
export type MemberRow = {
  user_id: string;
  member_id: string | null;
  display_name: string | null;
  email: string | null;
  role_key: string;
  role_name: string;
  role_rank: number;
  category: string;
  status: MemberStatus;
  is_active: boolean;
  avatar_url: string | null;
  department_code: string | null;
  department_name: string | null;
  position: string | null;
  staff_id: string | null;
  staff_id_verified_at: string | null;
  updated_at: string;
  registration_payment_status: string | null;
};

/** GET /me/sessions - satu baris = satu peranti (satu family refresh token). */
export type SessionRecord = {
  id: string;
  user_agent: string | null;
  created_ip: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
};

/** `authz.CategoryManagement` di backend. */
export const CATEGORY_MANAGEMENT = "management";

export function isManagement(profile: Profile): boolean {
  return profile.category === CATEGORY_MANAGEMENT;
}

/** `type` pada post - `postResponse.Type`, internal/http/handlers/posts_common.go. */
export type PostType = "normal" | "announcement";

/** Blok `author` sepunya pada post & comment - `authorResponse`. */
export type PostAuthor = {
  user_id: string;
  member_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

/** GET /posts, GET /posts/:id, POST /posts, PATCH /posts/:id - `postResponse`. */
export type Post = {
  id: string;
  type: PostType;
  content: string;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  author: PostAuthor;
  images: string[];
  like_count: number;
  comment_count: number;
  comment_previews?: Comment[];
  liked_by_me: boolean;
};

/** GET /posts/:id/comments, POST /posts/:id/comments, PATCH /comments/:id - `commentResponse`. */
export type Comment = {
  id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  author: PostAuthor;
  like_count: number;
  liked_by_me: boolean;
};

/** GET /posts - keyset pagination, `next_cursor` null pada halaman terakhir. */
export type SenaraiPosRespons = {
  posts: Post[];
  next_cursor: string | null;
};

/** GET /posts/:id/comments. */
export type SenaraiKomenRespons = {
  comments: Comment[];
};
