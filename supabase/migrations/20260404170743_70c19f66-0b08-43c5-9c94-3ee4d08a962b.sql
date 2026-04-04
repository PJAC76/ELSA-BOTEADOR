
-- Enums
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE public.room_mode AS ENUM ('quick', 'friends');
CREATE TYPE public.room_status AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE public.match_status AS ENUM ('in_progress', 'finished');
CREATE TYPE public.match_winner AS ENUM ('agents', 'saboteur');
CREATE TYPE public.player_role AS ENUM ('agent', 'saboteur');
CREATE TYPE public.round_phase AS ENUM ('action', 'meeting', 'voting');
CREATE TYPE public.sanction_type AS ENUM ('ban_24h', 'warning');

-- Updated at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_config JSONB NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'es',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  hand_preference TEXT NOT NULL DEFAULT 'right',
  theme TEXT NOT NULL DEFAULT 'default',
  friend_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Jugadora'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FRIENDSHIPS
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 6),
  host_id UUID NOT NULL,
  mode public.room_mode NOT NULL DEFAULT 'friends',
  language TEXT NOT NULL DEFAULT 'es',
  status public.room_status NOT NULL DEFAULT 'waiting',
  max_players INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROOM PLAYERS
CREATE TABLE public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- MATCHES
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  status public.match_status NOT NULL DEFAULT 'in_progress',
  current_round INTEGER NOT NULL DEFAULT 1,
  winner public.match_winner,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MATCH PLAYERS
CREATE TABLE public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.player_role NOT NULL DEFAULT 'agent',
  is_alive BOOLEAN NOT NULL DEFAULT true,
  current_zone INTEGER NOT NULL DEFAULT 1,
  UNIQUE(match_id, user_id)
);
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- ROUNDS
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  phase public.round_phase NOT NULL DEFAULT 'action',
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, round_number)
);
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  zone INTEGER NOT NULL,
  assigned_to UUID,
  completed_by UUID,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  task_type TEXT NOT NULL DEFAULT 'connections',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- VOTES
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  target_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(round_id, voter_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- CHAT MESSAGES
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_preset BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_id UUID NOT NULL,
  match_id UUID REFERENCES public.matches(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- SANCTIONS
CREATE TABLE public.sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type public.sanction_type NOT NULL DEFAULT 'warning',
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;
