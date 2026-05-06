
-- Lobby chat messages, scoped per room
CREATE TABLE public.lobby_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  client_msg_id UUID,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX lobby_messages_room_created_idx ON public.lobby_messages(room_id, created_at);
CREATE UNIQUE INDEX lobby_messages_dedupe_idx ON public.lobby_messages(room_id, sender_id, client_msg_id) WHERE client_msg_id IS NOT NULL;

ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is user a member of a room (host or in room_players)
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rooms r WHERE r.id = _room_id AND r.host_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.room_players rp WHERE rp.room_id = _room_id AND rp.user_id = _user_id
  );
$$;

CREATE POLICY "Room members can view lobby messages"
ON public.lobby_messages FOR SELECT
USING (public.is_room_member(auth.uid(), room_id));

CREATE POLICY "Room members can send lobby messages"
ON public.lobby_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id AND public.is_room_member(auth.uid(), room_id));

CREATE POLICY "Admins can view all lobby messages"
ON public.lobby_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.lobby_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_messages;
