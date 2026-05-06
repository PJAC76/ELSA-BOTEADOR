ALTER TABLE public.lobby_messages
  ADD CONSTRAINT lobby_messages_message_length_chk
  CHECK (char_length(message) BETWEEN 1 AND 300);