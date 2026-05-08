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
  const enriched: GoogleSignInEvent = {
    timestamp: new Date().toISOString(),
    origin: evt.origin ?? (typeof window !== "undefined" ? window.location.origin : "unknown"),
    userAgent: evt.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
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
