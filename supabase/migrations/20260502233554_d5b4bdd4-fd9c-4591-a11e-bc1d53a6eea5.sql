-- Add review status tracking to reports
DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS status public.report_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Allow admins to update report review state
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
