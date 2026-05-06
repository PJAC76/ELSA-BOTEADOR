-- Prevent consecutive duplicate lobby messages from the same sender in the same room.
CREATE OR REPLACE FUNCTION public.prevent_duplicate_lobby_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_msg TEXT;
  last_at TIMESTAMPTZ;
BEGIN
  SELECT message, created_at
    INTO last_msg, last_at
  FROM public.lobby_messages
  WHERE room_id = NEW.room_id
    AND sender_id = NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_msg IS NOT NULL AND last_msg = NEW.message AND (now() - last_at) < interval '30 seconds' THEN
    RAISE EXCEPTION 'duplicate_message: no repitas el mismo mensaje'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lobby_messages_no_dup ON public.lobby_messages;
CREATE TRIGGER lobby_messages_no_dup
BEFORE INSERT ON public.lobby_messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_lobby_message();

-- Also block re-using the same client_msg_id (idempotency / replay protection).
CREATE UNIQUE INDEX IF NOT EXISTS lobby_messages_client_msg_id_uniq
  ON public.lobby_messages (client_msg_id)
  WHERE client_msg_id IS NOT NULL;