// Lightweight client-side metrics buffer for Google Sign-In attempts.
// Persists last N events in localStorage so they survive OAuth redirects
// and can be inspected from the browser console in production:
//   window.__googleSignInMetrics()

export type GoogleSignInOutcome =
  | "started"
  | "redirected"
  | "success"
  | "timeout"
  | "cancelled"
  | "error"
  | "ignored_concurrent";

export type GoogleSignInEvent = {
  attemptId: number;
  attemptNumber: number;
  outcome: GoogleSignInOutcome;
  durationMs?: number;
  origin: string;
  userAgent: string;
  errorMessage?: string;
  errorName?: string;
  timestamp: string;
  /** Anonymous, non-reversible identifier (sha256, first 12 hex chars) of
   *  the user_id (preferred) or email. Lets us correlate repeated failures
   *  per user without storing PII. */
  anonUserId?: string;
  anonSource?: "user_id" | "email" | "none";
};

// ---------------------------------------------------------------------------
// Anonymous user identifier (privacy-preserving)
// ---------------------------------------------------------------------------

const ANON_KEY = "elsa-boteador-google-signin-anon";

/** SHA-256(input) truncated to 12 hex chars. Salted with a fixed app prefix
 *  so the hash is not directly reusable across apps. Returns null if the
 *  Web Crypto API is unavailable or the input is empty. */
export const hashAnonId = async (input: string): Promise<string | null> => {
  if (!input) return null;
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  try {
    const data = new TextEncoder().encode(`elsa-boteador:${input.trim().toLowerCase()}`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex.slice(0, 12);
  } catch {
    return null;
  }
};

export type AnonIdRecord = { anonUserId: string; anonSource: "user_id" | "email" };

export const setAnonUserId = (rec: AnonIdRecord | null) => {
  try {
    if (!rec) sessionStorage.removeItem(ANON_KEY);
    else sessionStorage.setItem(ANON_KEY, JSON.stringify(rec));
  } catch {
    /* ignore */
  }
};

export const getAnonUserId = (): AnonIdRecord | null => {
  try {
    const raw = sessionStorage.getItem(ANON_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.anonUserId === "string") return parsed as AnonIdRecord;
    return null;
  } catch {
    return null;
  }
};

const STORAGE_KEY = "elsa-boteador-google-signin-metrics";
const MAX_EVENTS = 50;

const readBuffer = (): GoogleSignInEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBuffer = (events: GoogleSignInEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* localStorage may be full or unavailable; ignore */
  }
};

export const logGoogleSignInEvent = (
  evt: Omit<GoogleSignInEvent, "timestamp" | "origin" | "userAgent"> &
    Partial<Pick<GoogleSignInEvent, "origin" | "userAgent">>
) => {
  const anon = evt.anonUserId ? null : getAnonUserId();
  const enriched: GoogleSignInEvent = {
    timestamp: new Date().toISOString(),
    origin: evt.origin ?? (typeof window !== "undefined" ? window.location.origin : "unknown"),
    userAgent: evt.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
    anonUserId: evt.anonUserId ?? anon?.anonUserId,
    anonSource: evt.anonSource ?? anon?.anonSource ?? "none",
    ...evt,
  };

  // Console: structured log so it's easy to filter by [GoogleSignIn][metric] in DevTools.
  const tag = `[GoogleSignIn][metric][${enriched.outcome}]`;
  if (enriched.outcome === "error" || enriched.outcome === "timeout") {
    console.error(tag, enriched);
  } else if (enriched.outcome === "cancelled" || enriched.outcome === "ignored_concurrent") {
    console.warn(tag, enriched);
  } else {
    console.info(tag, enriched);
  }

  const buffer = readBuffer();
  buffer.push(enriched);
  writeBuffer(buffer);

  updateSessionSummary(enriched);
};

export const getGoogleSignInMetrics = (): GoogleSignInEvent[] => readBuffer();

export const clearGoogleSignInMetrics = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

// ---------------------------------------------------------------------------
// Per-session summary: tracks total retries and the final outcome of Google
// Sign-In attempts within the current browser session. Persisted in
// sessionStorage so it survives the OAuth redirect round-trip but resets when
// the user closes the tab.
// ---------------------------------------------------------------------------

export type GoogleFinalOutcome = "success" | "timeout" | "error" | "cancelled" | "pending";

export type GoogleSessionSummary = {
  totalAttempts: number;        // Counts user-initiated attempts (started)
  retries: number;              // totalAttempts - 1 (0 if first attempt)
  successes: number;
  timeouts: number;
  errors: number;
  cancellations: number;
  ignoredConcurrent: number;
  lastOutcome: GoogleFinalOutcome;
  lastErrorMessage?: string;
  firstAttemptAt?: string;
  lastAttemptAt?: string;
};

const SESSION_KEY = "elsa-boteador-google-signin-session";

const emptySummary = (): GoogleSessionSummary => ({
  totalAttempts: 0,
  retries: 0,
  successes: 0,
  timeouts: 0,
  errors: 0,
  cancellations: 0,
  ignoredConcurrent: 0,
  lastOutcome: "pending",
});

export const getGoogleSessionSummary = (): GoogleSessionSummary => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return emptySummary();
    const parsed = JSON.parse(raw);
    return { ...emptySummary(), ...parsed };
  } catch {
    return emptySummary();
  }
};

const writeSessionSummary = (s: GoogleSessionSummary) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const updateSessionSummary = (evt: GoogleSignInEvent) => {
  const s = getGoogleSessionSummary();

  if (evt.outcome === "started") {
    s.totalAttempts += 1;
    s.retries = Math.max(0, s.totalAttempts - 1);
    if (!s.firstAttemptAt) s.firstAttemptAt = evt.timestamp;
    s.lastAttemptAt = evt.timestamp;
    s.lastOutcome = "pending";
    s.lastErrorMessage = undefined;
  } else if (evt.outcome === "success") {
    s.successes += 1;
    s.lastOutcome = "success";
    s.lastErrorMessage = undefined;
    s.lastAttemptAt = evt.timestamp;
  } else if (evt.outcome === "timeout") {
    s.timeouts += 1;
    s.lastOutcome = "timeout";
    s.lastErrorMessage = evt.errorMessage;
    s.lastAttemptAt = evt.timestamp;
  } else if (evt.outcome === "error") {
    s.errors += 1;
    s.lastOutcome = "error";
    s.lastErrorMessage = evt.errorMessage;
    s.lastAttemptAt = evt.timestamp;
  } else if (evt.outcome === "cancelled") {
    s.cancellations += 1;
    s.lastOutcome = "cancelled";
    s.lastAttemptAt = evt.timestamp;
  } else if (evt.outcome === "ignored_concurrent") {
    s.ignoredConcurrent += 1;
  }
  // "redirected" is a transient state; lastOutcome stays "pending" until the
  // post-redirect page either logs success or another outcome.

  writeSessionSummary(s);
};

export const clearGoogleSessionSummary = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

// Expose a tiny helper on window for production debugging from the browser console.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__googleSignInMetrics = () => {
    const events = getGoogleSignInMetrics();
    console.table(
      events.map((e) => ({
        time: e.timestamp,
        attempt: e.attemptNumber,
        outcome: e.outcome,
        ms: e.durationMs ?? "",
        err: e.errorMessage ?? "",
        attemptId: e.attemptId,
      }))
    );
    return events;
  };
}
