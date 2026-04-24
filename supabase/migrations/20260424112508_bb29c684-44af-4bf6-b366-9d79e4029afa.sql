-- Add bot support to match_players
ALTER TABLE public.match_players
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bot_name text;

-- Allow user_id to be null for bots
ALTER TABLE public.match_players
  ALTER COLUMN user_id DROP NOT NULL;

-- Ensure either user_id or bot identity is present
ALTER TABLE public.match_players
  DROP CONSTRAINT IF EXISTS match_players_user_or_bot_check;
ALTER TABLE public.match_players
  ADD CONSTRAINT match_players_user_or_bot_check
  CHECK ((is_bot = true AND bot_name IS NOT NULL) OR (is_bot = false AND user_id IS NOT NULL));

-- Update is_match_player to ignore bots (bots have no auth.uid())
CREATE OR REPLACE FUNCTION public.is_match_player(_user_id uuid, _match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_players
    WHERE match_id = _match_id
      AND user_id = _user_id
      AND is_bot = false
  );
$$;

-- Enable realtime for rounds, tasks, match_players, matches (idempotent)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.matches; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Replica identity full so realtime sends complete rows
ALTER TABLE public.rounds REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.match_players REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;