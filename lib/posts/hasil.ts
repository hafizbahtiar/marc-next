/**
 * Keadaan pulangan bersama untuk tindakan pelayan modul post.
 *
 * Fail berasingan daripada `actions.ts` - fail `"use server"` hanya boleh
 * mengeksport fungsi async (lihat komen `KeadaanBorang` di lib/auth/borang.ts
 * untuk sebab yang sama).
 */
export type HasilTindakan<T = void> = { ok: true; data: T } | { ok: false; ralat: string };
