BEGIN;

CREATE OR REPLACE FUNCTION public.send_direct_message(
  p_conversation_id uuid,
  p_receiver_id uuid,
  p_content text
)
RETURNS public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  result_message public.messages;
  conversation_record public.conversations;
  clean_content text;
  recent_count integer;
BEGIN

  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COUNT(*)
  INTO recent_count
  FROM public.messages
  WHERE sender_id = current_user_id
    AND created_at > now() - interval '10 seconds';

  IF recent_count >= 20 THEN
    RAISE EXCEPTION
      'You are sending messages too fast. Please slow down.';
  END IF;

  clean_content := BTRIM(
    COALESCE(p_content, '')
  );

  IF clean_content = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;

  IF LENGTH(clean_content) > 10000 THEN
    RAISE EXCEPTION 'Message is too long';
  END IF;

  IF p_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Receiver is required';
  END IF;

  IF p_receiver_id = current_user_id THEN
    RAISE EXCEPTION
      'You cannot send a message to yourself';
  END IF;

  SELECT *
  INTO conversation_record
  FROM public.conversations
  WHERE id = p_conversation_id
    AND (
      participant1_id = current_user_id
      OR participant2_id = current_user_id
    )
  LIMIT 1;

  IF conversation_record.id IS NULL THEN
    RAISE EXCEPTION
      'Conversation not found or access denied';
  END IF;

  IF NOT (
    conversation_record.participant1_id = p_receiver_id
    OR conversation_record.participant2_id = p_receiver_id
  ) THEN
    RAISE EXCEPTION
      'Invalid receiver for this conversation';
  END IF;

  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    receiver_id,
    content
  )
  VALUES (
    p_conversation_id,
    current_user_id,
    p_receiver_id,
    clean_content
  )
  RETURNING *
  INTO result_message;

  RETURN result_message;

END;
$$;

GRANT EXECUTE
ON FUNCTION public.send_direct_message(uuid, uuid, text)
TO authenticated;

COMMIT;