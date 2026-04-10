
-- Create game_results table for per-player match statistics
CREATE TABLE public.game_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'agent',
  won BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  guessed_word BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own results
CREATE POLICY "Users can view own game results"
  ON public.game_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert own game results"
  ON public.game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_game_results_user_id ON public.game_results(user_id);
CREATE INDEX idx_game_results_match_id ON public.game_results(match_id);
