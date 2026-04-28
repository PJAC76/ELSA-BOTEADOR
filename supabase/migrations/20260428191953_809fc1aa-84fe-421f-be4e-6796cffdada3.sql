CREATE UNIQUE INDEX IF NOT EXISTS votes_round_voter_unique
  ON public.votes (round_id, voter_id);

CREATE INDEX IF NOT EXISTS votes_round_idx ON public.votes (round_id);