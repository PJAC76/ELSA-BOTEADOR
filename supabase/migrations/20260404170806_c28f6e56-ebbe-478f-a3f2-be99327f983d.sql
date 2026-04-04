
-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_match_player(_user_id UUID, _match_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.match_players WHERE match_id = _match_id AND user_id = _user_id); $$;

CREATE OR REPLACE FUNCTION public.is_round_player(_user_id UUID, _round_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.rounds r JOIN public.match_players mp ON mp.match_id = r.match_id WHERE r.id = _round_id AND mp.user_id = _user_id); $$;

-- PROFILES policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- FRIENDSHIPS policies
CREATE POLICY "Users see own friendships" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can request friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can delete own friendships" ON public.friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ROOMS policies
CREATE POLICY "Room members can view rooms" ON public.rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_players rp WHERE rp.room_id = id AND rp.user_id = auth.uid()) OR host_id = auth.uid()
);
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update room" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);

-- ROOM PLAYERS policies
CREATE POLICY "Room members can view players" ON public.room_players FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_players rp2 WHERE rp2.room_id = room_id AND rp2.user_id = auth.uid())
);
CREATE POLICY "Users can join rooms" ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ready status" ON public.room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_players FOR DELETE USING (auth.uid() = user_id);

-- MATCHES policies
CREATE POLICY "Match players can view match" ON public.matches FOR SELECT USING (public.is_match_player(auth.uid(), id));

-- MATCH PLAYERS policies
CREATE POLICY "Match players can view players" ON public.match_players FOR SELECT USING (public.is_match_player(auth.uid(), match_id));

-- ROUNDS policies
CREATE POLICY "Match players can view rounds" ON public.rounds FOR SELECT USING (public.is_match_player(auth.uid(), match_id));

-- TASKS policies
CREATE POLICY "Match players can view tasks" ON public.tasks FOR SELECT USING (public.is_round_player(auth.uid(), round_id));
CREATE POLICY "Players can complete tasks" ON public.tasks FOR UPDATE USING (public.is_round_player(auth.uid(), round_id));

-- VOTES policies
CREATE POLICY "Match players can view votes" ON public.votes FOR SELECT USING (public.is_round_player(auth.uid(), round_id));
CREATE POLICY "Players can cast votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = voter_id AND public.is_round_player(auth.uid(), round_id));

-- CHAT MESSAGES policies
CREATE POLICY "Match players can view chat" ON public.chat_messages FOR SELECT USING (public.is_round_player(auth.uid(), round_id));
CREATE POLICY "Players can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.is_round_player(auth.uid(), round_id));

-- REPORTS policies
CREATE POLICY "Authenticated users can report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can see own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- SANCTIONS policies
CREATE POLICY "Users can see own sanctions" ON public.sanctions FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
