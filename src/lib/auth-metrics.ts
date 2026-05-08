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
};

export const getGoogleSignInMetrics = (): GoogleSignInEvent[] => readBuffer();

export const clearGoogleSignInMetrics = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
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
