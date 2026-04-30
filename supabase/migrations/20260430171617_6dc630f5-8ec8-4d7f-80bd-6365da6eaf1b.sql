ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS client_msg_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_dedupe_idx
  ON public.chat_messages (round_id, sender_id, client_msg_id)
  WHERE client_msg_id IS NOT NULL;