-- Allow players to update their own zone / alive state in match_players
CREATE POLICY "Players can update own match_player"
ON public.match_players
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow match players to update rounds (phase) — used by clients triggering meeting/end
CREATE POLICY "Match players can update rounds"
ON public.rounds
FOR UPDATE
USING (public.is_match_player(auth.uid(), match_id));

-- Allow match players to update matches (current_round, status, winner) — coordinated by host
CREATE POLICY "Match players can update match"
ON public.matches
FOR UPDATE
USING (public.is_match_player(auth.uid(), id));

-- Sabotages table
CREATE TABLE public.sabotages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  zone INTEGER NOT NULL,
  saboteur_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sabotages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match players can view sabotages"
ON public.sabotages
FOR SELECT
USING (public.is_match_player(auth.uid(), match_id));

-- Indices
CREATE INDEX idx_sabotages_match ON public.sabotages(match_id);
CREATE INDEX idx_sabotages_round ON public.sabotages(round_id);

-- Replica identity FULL for realtime
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.match_players REPLICA IDENTITY FULL;
ALTER TABLE public.rounds REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.sabotages REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sabotages;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;