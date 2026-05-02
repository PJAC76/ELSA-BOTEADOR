import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReportReason =
  | "toxic-chat"
  | "cheating"
  | "inappropriate-name"
  | "harassment"
  | "spam"
  | "other";

export const REPORT_REASONS: { value: ReportReason; label: string; emoji: string }[] = [
  { value: "toxic-chat", label: "Chat tóxico", emoji: "💬" },
  { value: "cheating", label: "Trampa / Exploit", emoji: "🚫" },
  { value: "inappropriate-name", label: "Nombre inapropiado", emoji: "✏️" },
  { value: "harassment", label: "Acoso", emoji: "⚠️" },
  { value: "spam", label: "Spam", emoji: "📢" },
  { value: "other", label: "Otro motivo", emoji: "❓" },
];

/**
 * Per-message diagnostic payload attached to auto-moderation events.
 * Lets us audit *why* a message was blocked or masked: which locale
 * dictionary was active, what severe/mild terms matched, and the
 * before/after text. Manual reports usually omit this.
 */
export type ReportDiagnostics = {
  /** Active filter locale at the time of detection (e.g. "es", "en"). */
  language: string;
  /** Severity bucket the analyzer assigned. */
  severity: "clean" | "mild" | "severe";
  /** Normalized severe dictionary terms that matched. */
  severeMatches: string[];
  /** Normalized mild dictionary terms that matched. */
  mildMatches: string[];
  /** Raw text the player sent (before masking). */
  originalText: string;
  /** Text after masking (what other players actually saw). */
  maskedText: string;
  /** Optional source identifier (e.g. chat message id). */
  sourceId?: string;
};

type Report = {
  id: string;
  reportedPlayerId: string;
  reportedPlayerName: string;
  reason: ReportReason;
  timestamp: number;
  diagnostics?: ReportDiagnostics;
};

type ReportsStore = {
  reports: Report[];
  bannedUntil: Record<string, number>; // playerId → timestamp
  submitReport: (report: Omit<Report, "id" | "timestamp">) => { banned: boolean };
  isPlayerBanned: (playerId: string) => boolean;
  getReportCount24h: (playerId: string) => number;
};

const BAN_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const BAN_THRESHOLD = 3;

export const useReportsStore = create<ReportsStore>()(
  persist(
    (set, get) => ({
      reports: [],
      bannedUntil: {},
      submitReport: (report) => {
        const newReport: Report = {
          ...report,
          id: `report-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: Date.now(),
        };

        set((s) => ({ reports: [...s.reports, newReport] }));

        // Check if player now has 3+ reports in 24h
        const count = get().getReportCount24h(report.reportedPlayerId);
        if (count >= BAN_THRESHOLD) {
          set((s) => ({
            bannedUntil: {
              ...s.bannedUntil,
              [report.reportedPlayerId]: Date.now() + BAN_DURATION,
            },
          }));
          return { banned: true };
        }
        return { banned: false };
      },
      isPlayerBanned: (playerId) => {
        const until = get().bannedUntil[playerId];
        if (!until) return false;
        if (Date.now() > until) {
          // Ban expired, clean up
          set((s) => {
            const next = { ...s.bannedUntil };
            delete next[playerId];
            return { bannedUntil: next };
          });
          return false;
        }
        return true;
      },
      getReportCount24h: (playerId) => {
        const cutoff = Date.now() - BAN_DURATION;
        return get().reports.filter(
          (r) => r.reportedPlayerId === playerId && r.timestamp > cutoff
        ).length;
      },
    }),
    { name: "elsa-boteador-reports" }
  )
);
