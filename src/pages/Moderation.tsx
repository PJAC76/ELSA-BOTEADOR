import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { listFilterTerms, getFilterStats } from "@/lib/chat-filter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Copy, Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

type ReportDiagnostics = {
  language?: string;
  severity?: string;
  severeMatches?: string[];
  mildMatches?: string[];
  originalText?: string;
  maskedText?: string;
  sourceId?: string;
};

type ReportRow = {
  id: string;
  created_at: string;
  reason: string;
  match_id: string | null;
  reported_id: string;
  reporter_id: string;
  diagnostics?: ReportDiagnostics | null;
  source?: string | null;
  severity?: string | null;
  language?: string | null;
  status?: "pending" | "reviewed" | "resolved" | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

type ReportStatus = "pending" | "reviewed" | "resolved";

type ProfileMini = { user_id: string; display_name: string };

export default function Moderation() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: label });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Verify role
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!!data && !error);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadReports = async (opts?: { page?: number; pageSize?: number }) => {
    const p = opts?.page ?? page;
    const ps = opts?.pageSize ?? pageSize;
    setLoading(true);
    const from = p * ps;
    const to = from + ps - 1;
    let q = supabase
      .from("reports")
      .select(
        "id, created_at, reason, match_id, reported_id, reporter_id, diagnostics, source, severity, language, status, reviewed_by, reviewed_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (filterStatus !== "all") q = q.eq("status", filterStatus);
    if (dateFrom) q = q.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      q = q.lte("created_at", end.toISOString());
    }
    const { data, error, count } = await q;
    if (!error && data) {
      setReports(data as unknown as ReportRow[]);
      if (typeof count === "number") setTotalCount(count);
      const ids = Array.from(
        new Set(
          (data as unknown as ReportRow[]).flatMap((r) => [r.reported_id, r.reporter_id]),
        ),
      );
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", ids);
        const map: Record<string, string> = {};
        (profs as ProfileMini[] | null)?.forEach((p2) => {
          map[p2.user_id] = p2.display_name;
        });
        setProfiles(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadReports({ page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const applyFilters = () => {
    setPage(0);
    loadReports({ page: 0 });
  };

  const goToPage = (next: number) => {
    const maxPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1);
    const clamped = Math.min(Math.max(0, next), maxPage);
    setPage(clamped);
    loadReports({ page: clamped });
  };

  const changePageSize = (ps: number) => {
    setPageSize(ps);
    setPage(0);
    loadReports({ page: 0, pageSize: ps });
  };

  const [termsLang, setTermsLang] = useState<"es" | "en">("es");
  const terms = useMemo(() => listFilterTerms(termsLang), [termsLang]);
  const stats = useMemo(() => getFilterStats(termsLang), [termsLang]);

  // Filters for the events list
  const [filterLang, setFilterLang] = useState<"all" | "es" | "en">("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "severe" | "mild" | "clean">("all");
  const [filterMatch, setFilterMatch] = useState<string>("");
  const [searchSource, setSearchSource] = useState<string>("");

  const findAndOpen = (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return;
    const found = reports.find(
      (r) =>
        r.id.toLowerCase().startsWith(q) ||
        (r.diagnostics?.sourceId ?? "").toLowerCase().startsWith(q) ||
        (r.diagnostics?.sourceId ?? "").toLowerCase() === q,
    );
    if (!found) {
      toast({ title: "Not found", description: `No event for "${raw}"`, variant: "destructive" });
      return;
    }
    // Reset filters that could hide it
    setFilterLang("all");
    setFilterSeverity("all");
    setFilterMatch("");
    setOpenId(found.id);
    setTimeout(() => {
      const el = document.getElementById(`evt-${found.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  // Deep link: ?source=<id> or #source=<id>
  useEffect(() => {
    if (!reports.length) return;
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("source");
    const hash = window.location.hash.startsWith("#source=")
      ? window.location.hash.slice("#source=".length)
      : "";
    const target = fromQuery || hash;
    if (target) findAndOpen(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  const filteredReports = useMemo(() => {
    const q = filterMatch.trim().toLowerCase();
    return reports.filter((r) => {
      if (filterLang !== "all" && (r.language ?? r.diagnostics?.language) !== filterLang) return false;
      if (filterSeverity !== "all" && (r.severity ?? r.diagnostics?.severity) !== filterSeverity) return false;
      if (q) {
        const sev = r.diagnostics?.severeMatches ?? [];
        if (!sev.some((w) => w.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [reports, filterLang, filterSeverity, filterMatch]);

  // Loading auth
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No access
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">{t("modAccessDenied")}</h1>
          <p className="text-muted-foreground">{t("modAccessDeniedDesc")}</p>
          <Button asChild variant="outline">
            <Link to="/">{t("back")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleString();
  const nameOf = (id: string) =>
    profiles[id] ?? `${id.slice(0, 6)}…`;

  const isAuto = (reason: string) =>
    reason.toLowerCase().includes("toxic") ||
    reason.toLowerCase().includes("auto");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-primary" />
              {t("modTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("modSubtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">{t("back")}</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => loadReports()}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("modRefresh")}
            </Button>
          </div>
        </div>

        {/* Global search by sourceId / event id */}
        <Card className="p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              findAndOpen(searchSource);
            }}
            className="flex items-center gap-2 flex-wrap"
          >
            <label className="text-xs text-muted-foreground">Find event</label>
            <input
              type="text"
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value)}
              placeholder="Paste sourceId or event ID…"
              className="h-9 flex-1 min-w-[220px] rounded-md border bg-background px-2 text-sm font-mono"
            />
            <Button type="submit" size="sm" disabled={!searchSource.trim()}>
              Open
            </Button>
            {searchSource && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSearchSource("")}
              >
                Clear
              </Button>
            )}
          </form>
        </Card>
        <Tabs defaultValue="reports" className="w-full">
          <TabsList>
            <TabsTrigger value="reports">
              {t("modReportsTab")}{" "}
              <Badge variant="secondary" className="ml-2">
                {reports.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="terms">
              {t("modTermsTab")}{" "}
              <Badge variant="secondary" className="ml-2">
                {stats.severeCount}/{stats.mildCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Reports tab */}
          <TabsContent value="reports" className="mt-4">
            <Card className="p-4 space-y-3">
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                  />
                </div>
                <Button size="sm" onClick={applyFilters} disabled={loading}>
                  Apply
                </Button>
                {(dateFrom || dateTo) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setTimeout(applyFilters, 0);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {/* Diagnostic filters */}
              <div className="flex items-end gap-2 flex-wrap border-t pt-3">
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">Language</label>
                  <div className="inline-flex rounded-md border p-0.5">
                    {(["all", "es", "en"] as const).map((v) => (
                      <Button
                        key={v}
                        type="button"
                        size="sm"
                        variant={filterLang === v ? "default" : "ghost"}
                        className="h-7 px-3 text-xs"
                        onClick={() => setFilterLang(v)}
                      >
                        {v.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">Severity</label>
                  <div className="inline-flex rounded-md border p-0.5">
                    {(["all", "severe", "mild", "clean"] as const).map((v) => (
                      <Button
                        key={v}
                        type="button"
                        size="sm"
                        variant={filterSeverity === v ? "default" : "ghost"}
                        className="h-7 px-3 text-xs capitalize"
                        onClick={() => setFilterSeverity(v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label className="text-xs text-muted-foreground mb-1">Severe match</label>
                  <input
                    type="text"
                    value={filterMatch}
                    onChange={(e) => setFilterMatch(e.target.value)}
                    placeholder="e.g. puta, bitch…"
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                  />
                </div>
                <div className="text-xs text-muted-foreground ml-auto">
                  {filteredReports.length} / {reports.length}
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("modLoading")}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t("modNoReports")}
                </div>
              ) : (
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-2 pr-2">
                    {filteredReports.map((r) => {
                      const d = r.diagnostics ?? null;
                      return (
                        <div
                          key={r.id}
                          id={`evt-${r.id}`}
                          className={`rounded-lg border bg-card p-3 text-sm space-y-2 transition-shadow ${openId === r.id ? "ring-2 ring-primary" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={isAuto(r.reason) ? "destructive" : "secondary"}
                              >
                                {isAuto(r.reason)
                                  ? t("modAutoBadge")
                                  : t("modManualBadge")}
                              </Badge>
                              {r.severity && (
                                <Badge variant="outline" className="uppercase text-[10px]">
                                  {r.severity}
                                </Badge>
                              )}
                              {r.language && (
                                <Badge variant="outline" className="text-[10px]">
                                  {r.language.toUpperCase()}
                                </Badge>
                              )}
                              <span className="font-medium">
                                {t("modReported")}: {nameOf(r.reported_id)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(r.created_at)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div>
                              <span className="font-semibold">{t("modReporter")}:</span>{" "}
                              {nameOf(r.reporter_id)}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold">{t("modMatch")}:</span>{" "}
                              {r.match_id ? r.match_id.slice(0, 8) + "…" : "—"}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">{t("modReason")}:</span>{" "}
                            <span className="break-words">{r.reason}</span>
                          </div>
                          {d && (
                            <Collapsible
                              open={openId === r.id}
                              onOpenChange={(o) => setOpenId(o ? r.id : null)}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <CollapsibleTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs gap-1"
                                  >
                                    <ChevronDown
                                      className={`h-3 w-3 transition-transform ${openId === r.id ? "rotate-180" : ""}`}
                                    />
                                    Diagnostics
                                  </Button>
                                </CollapsibleTrigger>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs gap-1"
                                  onClick={() =>
                                    copy("Full diagnostics JSON", JSON.stringify(d, null, 2))
                                  }
                                >
                                  <Copy className="h-3 w-3" /> JSON
                                </Button>
                                {(d.severeMatches?.length ?? 0) > 0 && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    {d.severeMatches!.length} severe
                                  </Badge>
                                )}
                                {(d.mildMatches?.length ?? 0) > 0 && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {d.mildMatches!.length} mild
                                  </Badge>
                                )}
                              </div>
                              <CollapsibleContent className="mt-2">
                                <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-3">
                                  {d.severeMatches && d.severeMatches.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                                          Severe matches
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-1.5 text-[10px] gap-1"
                                          onClick={() =>
                                            copy("Severe matches", d.severeMatches!.join(", "))
                                          }
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {d.severeMatches.map((w) => (
                                          <Badge
                                            key={`sv-${r.id}-${w}`}
                                            variant="destructive"
                                            className="font-mono text-[10px]"
                                          >
                                            {w}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {d.mildMatches && d.mildMatches.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                                          Mild matches
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-1.5 text-[10px] gap-1"
                                          onClick={() =>
                                            copy("Mild matches", d.mildMatches!.join(", "))
                                          }
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {d.mildMatches.map((w) => (
                                          <Badge
                                            key={`md-${r.id}-${w}`}
                                            variant="secondary"
                                            className="font-mono text-[10px]"
                                          >
                                            {w}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {d.originalText && (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                                          Original text
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-1.5 text-[10px] gap-1"
                                          onClick={() => copy("Original text", d.originalText!)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <pre className="whitespace-pre-wrap break-words rounded bg-background/60 border p-2 font-mono text-[11px]">
                                        {d.originalText}
                                      </pre>
                                    </div>
                                  )}
                                  {d.maskedText && (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                                          Masked text
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-1.5 text-[10px] gap-1"
                                          onClick={() => copy("Masked text", d.maskedText!)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <pre className="whitespace-pre-wrap break-words rounded bg-background/60 border p-2 font-mono text-[11px]">
                                        {d.maskedText}
                                      </pre>
                                    </div>
                                  )}
                                  {d.sourceId && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <div>
                                        <span className="font-semibold">Msg ID:</span>{" "}
                                        <span className="font-mono">{d.sourceId}</span>
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-1.5 text-[10px] gap-1"
                                        onClick={() => copy("Message ID", d.sourceId!)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              {/* Pagination */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Per page</span>
                  <div className="inline-flex rounded-md border p-0.5">
                    {[25, 50, 100, 200].map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={pageSize === n ? "default" : "ghost"}
                        className="h-7 px-2 text-xs"
                        onClick={() => changePageSize(n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {totalCount === 0
                    ? "0"
                    : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, totalCount)} of ${totalCount}`}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading || page === 0}
                    onClick={() => goToPage(0)}
                  >
                    «
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading || page === 0}
                    onClick={() => goToPage(page - 1)}
                  >
                    Prev
                  </Button>
                  <span className="px-2">
                    {page + 1} / {Math.max(1, Math.ceil(totalCount / pageSize))}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading || (page + 1) * pageSize >= totalCount}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading || (page + 1) * pageSize >= totalCount}
                    onClick={() => goToPage(Math.ceil(totalCount / pageSize) - 1)}
                  >
                    »
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Terms tab */}
          <TabsContent value="terms" className="mt-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground">{t("modTermsHint")}</p>
                <div className="inline-flex rounded-md border p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={termsLang === "es" ? "default" : "ghost"}
                    className="h-7 px-3 text-xs"
                    onClick={() => setTermsLang("es")}
                  >
                    ES
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={termsLang === "en" ? "default" : "ghost"}
                    className="h-7 px-3 text-xs"
                    onClick={() => setTermsLang("en")}
                  >
                    EN
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="destructive">{terms.severe.length}</Badge>
                    {t("modSevereTerms")}
                  </h3>
                  <ScrollArea className="h-[50vh] rounded-md border p-2">
                    <div className="flex flex-wrap gap-1">
                      {terms.severe.map((w) => (
                        <Badge
                          key={`s-${w}`}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{terms.mild.length}</Badge>
                    {t("modMildTerms")}
                  </h3>
                  <ScrollArea className="h-[50vh] rounded-md border p-2">
                    <div className="flex flex-wrap gap-1">
                      {terms.mild.map((w) => (
                        <Badge
                          key={`m-${w}`}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
