import { describe, it, expect, beforeEach } from "vitest";
import { analyzeMessage, type FilterLanguage } from "@/lib/chat-filter";
import { useReportsStore } from "@/stores/reports-store";

/**
 * Replicates the auto-report payload built in MeetingScreen.tsx when an
 * incoming chat message is flagged as severe. Keeps the shape in sync
 * with the production code path.
 */
function buildAutoReport(
  msg: { id: string; sender_id: string; message: string },
  lang: FilterLanguage,
  reportedName = "Jugadora",
) {
  const analysis = analyzeMessage(msg.message, lang);
  return {
    analysis,
    payload: {
      reportedPlayerId: msg.sender_id,
      reportedPlayerName: reportedName,
      reason: "toxic-chat" as const,
      diagnostics: {
        language: lang,
        severity: analysis.severity,
        severeMatches: analysis.severeMatches,
        mildMatches: analysis.mildMatches,
        originalText: msg.message,
        maskedText: analysis.maskedText,
        sourceId: msg.id,
      },
    },
  };
}

describe("moderation diagnostics payload", () => {
  beforeEach(() => {
    useReportsStore.setState({ reports: [], bannedUntil: {} });
  });

  it("includes complete diagnostics when a severe ES message is auto-reported", () => {
    const msg = { id: "msg-1", sender_id: "user-es", message: "eres una puta tonta" };
    const { analysis, payload } = buildAutoReport(msg, "es", "Ana");

    expect(analysis.severity).toBe("severe");
    expect(analysis.severeMatches).toContain("puta");
    expect(analysis.mildMatches).toContain("tonta");
    expect(analysis.maskedText).not.toContain("puta");
    expect(analysis.maskedText).not.toContain("tonta");

    useReportsStore.getState().submitReport(payload);

    const stored = useReportsStore.getState().reports[0];
    expect(stored.diagnostics).toBeDefined();
    expect(stored.diagnostics).toEqual({
      language: "es",
      severity: "severe",
      severeMatches: analysis.severeMatches,
      mildMatches: analysis.mildMatches,
      originalText: msg.message,
      maskedText: analysis.maskedText,
      sourceId: msg.id,
    });
  });

  it("uses the EN dictionary when language is en", () => {
    const msg = { id: "msg-2", sender_id: "user-en", message: "you damn bitch" };
    const { analysis, payload } = buildAutoReport(msg, "en");

    expect(analysis.severity).toBe("severe");
    expect(analysis.severeMatches).toContain("bitch");
    expect(analysis.mildMatches).toContain("damn");

    useReportsStore.getState().submitReport(payload);
    const stored = useReportsStore.getState().reports[0];

    expect(stored.diagnostics?.language).toBe("en");
    expect(stored.diagnostics?.severeMatches).toEqual(analysis.severeMatches);
    expect(stored.diagnostics?.mildMatches).toEqual(analysis.mildMatches);
    expect(stored.diagnostics?.originalText).toBe(msg.message);
    expect(stored.diagnostics?.maskedText).toBe(analysis.maskedText);
    expect(stored.diagnostics?.sourceId).toBe(msg.id);
  });

  it("respects per-locale severity differences (perra severe in ES, not in EN)", () => {
    const text = "perra";
    const es = analyzeMessage(text, "es");
    const en = analyzeMessage(text, "en");
    expect(es.severity).toBe("severe");
    expect(es.severeMatches).toContain("perra");
    expect(en.severity).toBe("clean");
    expect(en.severeMatches).toEqual([]);
  });

  it("payload diagnostics matches the processed message exactly", () => {
    const msg = { id: "msg-3", sender_id: "user-x", message: "que mierda, puta" };
    const { analysis, payload } = buildAutoReport(msg, "es");

    // Round-trip: re-running the analyzer on the stored originalText must
    // reproduce the stored severeMatches/mildMatches/maskedText/severity.
    useReportsStore.getState().submitReport(payload);
    const stored = useReportsStore.getState().reports[0];
    const replay = analyzeMessage(stored.diagnostics!.originalText, "es");

    expect(replay.severity).toBe(stored.diagnostics!.severity);
    expect(replay.severeMatches).toEqual(stored.diagnostics!.severeMatches);
    expect(replay.mildMatches).toEqual(stored.diagnostics!.mildMatches);
    expect(replay.maskedText).toBe(stored.diagnostics!.maskedText);
    expect(stored.diagnostics!.maskedText).toBe(analysis.maskedText);
    expect(stored.diagnostics!.sourceId).toBe(msg.id);
    expect(stored.reportedPlayerId).toBe(msg.sender_id);
    expect(stored.reason).toBe("toxic-chat");
  });

  it("preserves all required diagnostic fields", () => {
    const msg = { id: "msg-4", sender_id: "user-y", message: "kys" };
    const { payload } = buildAutoReport(msg, "es");
    useReportsStore.getState().submitReport(payload);
    const d = useReportsStore.getState().reports[0].diagnostics!;
    expect(Object.keys(d).sort()).toEqual(
      ["language", "maskedText", "mildMatches", "originalText", "severeMatches", "severity", "sourceId"].sort(),
    );
    expect(d.severity).toBe("severe");
    expect(d.severeMatches).toContain("kys");
  });
});
