-- Add structured diagnostics to reports for moderation audits
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS diagnostics jsonb,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS severity text,
  ADD COLUMN IF NOT EXISTS language text;

-- GIN index for flexible JSON queries (e.g., terms, sourceId)
CREATE INDEX IF NOT EXISTS reports_diagnostics_gin
  ON public.reports USING gin (diagnostics jsonb_path_ops);

-- B-tree index for date-range audits
CREATE INDEX IF NOT EXISTS reports_created_at_idx
  ON public.reports (created_at DESC);

-- Filter helpers
CREATE INDEX IF NOT EXISTS reports_severity_idx
  ON public.reports (severity);
CREATE INDEX IF NOT EXISTS reports_language_idx
  ON public.reports (language);
CREATE INDEX IF NOT EXISTS reports_source_idx
  ON public.reports (source);