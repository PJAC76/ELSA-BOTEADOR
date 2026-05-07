import { supabase } from "@/integrations/supabase/client";

/**
 * Persisted Zustand store keys that hold gameplay/account-bound state.
 * Cleared on sign-out so the next user (or guest) doesn't inherit progress.
 *
 * NOT cleared (device-level prefs):
 *  - elsa-boteador-settings  (language, accessibility, sound)
 *  - elsa-boteador-theme     (visual theme)
 */
const ACCOUNT_BOUND_STORE_KEYS = [
  "elsa-boteador-progression",
  "elsa-boteador-streak",
  "elsa-boteador-challenges",
  "elsa-boteador-shop",
  "elsa-boteador-reports",
  "elsa-boteador-squad-league",
  "bff-store",
];

export type SignOutResult = { ok: true } | { ok: false; error: string };

/**
 * Centralized sign-out:
 *  1. Invalidates the Supabase session globally (revokes refresh token across devices).
 *  2. Clears account-bound persisted Zustand stores from localStorage.
 *  3. Clears sessionStorage.
 *  4. Reloads the page so React state trees rebuild from scratch.
 */
export async function signOutAndReset(): Promise<SignOutResult> {
  try {
    // 1. Revoke session on Supabase (global = invalidate all refresh tokens for this user)
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      console.error("[SignOut] supabase.auth.signOut error", error);
      return { ok: false, error: error.message };
    }

    // 2. Clear account-bound persisted stores
    try {
      for (const key of ACCOUNT_BOUND_STORE_KEYS) {
        localStorage.removeItem(key);
      }
      // Also clear any stray supabase auth tokens that could survive
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn("[SignOut] Failed to clear localStorage keys", e);
    }

    // 3. Clear sessionStorage (transient match/lobby caches)
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("[SignOut] Failed to clear sessionStorage", e);
    }

    // 4. Hard reload — easiest way to discard in-memory Zustand state and
    //    React component trees that may still hold references to the old user.
    window.location.replace("/");
    return { ok: true };
  } catch (err: any) {
    console.error("[SignOut] Unexpected error", err);
    return { ok: false, error: err?.message || "Unexpected sign-out error" };
  }
}
