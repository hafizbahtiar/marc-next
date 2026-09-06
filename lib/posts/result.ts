/**
 * Shared return state for post server actions.
 *
 * Kept separate from `actions.ts` because files marked `"use server"` may
 * only export async functions.
 */
export type HasilTindakan<T = void> = { ok: true; data: T } | { ok: false; ralat: string };
