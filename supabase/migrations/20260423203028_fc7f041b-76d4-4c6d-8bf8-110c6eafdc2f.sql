
-- 1. Fix broken RLS on room_players
DROP POLICY IF EXISTS "Room members can view players" ON public.room_players;

CREATE POLICY "Room members can view players"
ON public.room_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_players self
    WHERE self.room_id = room_players.room_id
      AND self.user_id = auth.uid()
  )
);

-- 2. Fix broken RLS on rooms
DROP POLICY IF EXISTS "Room members can view rooms" ON public.rooms;

CREATE POLICY "Room members can view rooms"
ON public.rooms
FOR SELECT
USING (
  host_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = rooms.id
      AND rp.user_id = auth.uid()
  )
);

-- 3. Allow anyone authenticated to look up a room by code
DROP POLICY IF EXISTS "Authenticated users can find rooms by code" ON public.rooms;
CREATE POLICY "Authenticated users can find rooms by code"
ON public.rooms
FOR SELECT
TO authenticated
USING (true);

-- 4. Uppercase + unique codes
UPDATE public.rooms SET code = UPPER(code) WHERE code != UPPER(code);

ALTER TABLE public.rooms
  ALTER COLUMN code SET DEFAULT UPPER(substr(md5((random())::text), 1, 6));

CREATE UNIQUE INDEX IF NOT EXISTS rooms_code_unique_idx ON public.rooms(code);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS room_players_room_id_idx ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS room_players_user_id_idx ON public.room_players(user_id);
CREATE INDEX IF NOT EXISTS match_players_match_id_idx ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS match_players_user_id_idx ON public.match_players(user_id);

-- 6. Realtime — only add if not already in publication
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_players REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'room_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'match_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
  END IF;
END $$;
