BEGIN;

-- ============================================================
-- BIZBASE REALTIME MESSAGING UPGRADE
-- ============================================================

-- ------------------------------------------------------------
-- 1. MESSAGE DELIVERY / READ STATE
-- ------------------------------------------------------------

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz;


-- Existing data migration
UPDATE public.messages
SET
  delivered_at = COALESCE(delivered_at, created_at),
  read_at = CASE
    WHEN read = true THEN COALESCE(read_at, created_at)
    ELSE read_at
  END
WHERE delivered_at IS NULL
   OR (read = true AND read_at IS NULL);


-- ------------------------------------------------------------
-- 2. CONVERSATION LAST MESSAGE DATA
-- ------------------------------------------------------------

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_message_preview text;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz;


-- ------------------------------------------------------------
-- 3. PREVENT SELF CONVERSATIONS
-- ------------------------------------------------------------

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_participants_different;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_participants_different
  CHECK (participant1_id <> participant2_id);


-- ------------------------------------------------------------
-- 4. CANONICAL UNIQUE DIRECT CONVERSATION
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_conversations_unique_participants
ON public.conversations (
  LEAST(participant1_id, participant2_id),
  GREATEST(participant1_id, participant2_id)
);


-- ------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS
  idx_messages_conversation_created
ON public.messages (
  conversation_id,
  created_at
);

CREATE INDEX IF NOT EXISTS
  idx_messages_receiver_read
ON public.messages (
  receiver_id,
  read
);

CREATE INDEX IF NOT EXISTS
  idx_messages_receiver_conversation_read
ON public.messages (
  receiver_id,
  conversation_id,
  read
);

CREATE INDEX IF NOT EXISTS
  idx_messages_receiver_created
ON public.messages (
  receiver_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_messages_sender_created
ON public.messages (
  sender_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_messages_delivered
ON public.messages (
  delivered_at
);

CREATE INDEX IF NOT EXISTS
  idx_messages_read_at
ON public.messages (
  read_at
);

CREATE INDEX IF NOT EXISTS
  idx_conversations_participant1_updated
ON public.conversations (
  participant1_id,
  updated_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_conversations_participant2_updated
ON public.conversations (
  participant2_id,
  updated_at DESC
);


-- ------------------------------------------------------------
-- 6. BACKFILL OLD MESSAGES WITHOUT CONVERSATION
-- ------------------------------------------------------------

DO $$
DECLARE
  message_row RECORD;
  conversation_row public.conversations;
BEGIN

  FOR message_row IN
    SELECT
      id,
      sender_id,
      receiver_id
    FROM public.messages
    WHERE conversation_id IS NULL
      AND sender_id <> receiver_id
  LOOP

    INSERT INTO public.conversations (
      participant1_id,
      participant2_id
    )
    VALUES (
      LEAST(
        message_row.sender_id,
        message_row.receiver_id
      ),
      GREATEST(
        message_row.sender_id,
        message_row.receiver_id
      )
    )
    ON CONFLICT DO NOTHING;

    SELECT *
    INTO conversation_row
    FROM public.conversations
    WHERE (
      participant1_id = message_row.sender_id
      AND participant2_id = message_row.receiver_id
    )
    OR (
      participant1_id = message_row.receiver_id
      AND participant2_id = message_row.sender_id
    )
    LIMIT 1;

    IF conversation_row.id IS NOT NULL THEN

      UPDATE public.messages
      SET conversation_id = conversation_row.id
      WHERE id = message_row.id;

    END IF;

  END LOOP;

END $$;


-- ------------------------------------------------------------
-- 7. CONVERSATION LAST MESSAGE TRIGGER
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_conversation_after_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  UPDATE public.conversations
  SET
    updated_at = NEW.created_at,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(
      REGEXP_REPLACE(
        COALESCE(NEW.content, ''),
        '[[:space:]]+',
        ' ',
        'g'
      ),
      160
    )
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS
  trg_update_conversation_after_message
ON public.messages;

CREATE TRIGGER
  trg_update_conversation_after_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_after_message();


-- ------------------------------------------------------------
-- 8. GET OR CREATE DIRECT CONVERSATION
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  p_other_user_id uuid
)
RETURNS public.conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  result_conversation public.conversations;
BEGIN

  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_other_user_id IS NULL THEN
    RAISE EXCEPTION 'Other user is required';
  END IF;

  IF current_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'You cannot start a conversation with yourself';
  END IF;

  INSERT INTO public.conversations (
    participant1_id,
    participant2_id
  )
  VALUES (
    LEAST(current_user_id, p_other_user_id),
    GREATEST(current_user_id, p_other_user_id)
  )
  ON CONFLICT DO NOTHING;

  SELECT *
  INTO result_conversation
  FROM public.conversations
  WHERE (
    participant1_id = current_user_id
    AND participant2_id = p_other_user_id
  )
  OR (
    participant1_id = p_other_user_id
    AND participant2_id = current_user_id
  )
  LIMIT 1;

  IF result_conversation.id IS NULL THEN
    RAISE EXCEPTION 'Unable to create conversation';
  END IF;

  RETURN result_conversation;

END;
$$;


GRANT EXECUTE
ON FUNCTION public.get_or_create_direct_conversation(uuid)
TO authenticated;


-- ------------------------------------------------------------
-- 9. SECURE MESSAGE SENDING RPC
-- ------------------------------------------------------------

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
BEGIN

  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  clean_content := BTRIM(COALESCE(p_content, ''));

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
    RAISE EXCEPTION 'You cannot send a message to yourself';
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
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  IF NOT (
    conversation_record.participant1_id = p_receiver_id
    OR conversation_record.participant2_id = p_receiver_id
  ) THEN
    RAISE EXCEPTION 'Invalid receiver for this conversation';
  END IF;

  IF p_receiver_id = current_user_id THEN
    RAISE EXCEPTION 'Invalid receiver';
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


-- ------------------------------------------------------------
-- 10. MARK ONE MESSAGE DELIVERED
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_message_delivered(
  p_message_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  UPDATE public.messages
  SET delivered_at = COALESCE(delivered_at, now())
  WHERE id = p_message_id
    AND receiver_id = auth.uid();

END;
$$;


GRANT EXECUTE
ON FUNCTION public.mark_message_delivered(uuid)
TO authenticated;


-- ------------------------------------------------------------
-- 11. MARK CONVERSATION READ
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  p_conversation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  UPDATE public.messages
  SET
    delivered_at = COALESCE(delivered_at, now()),
    read = true,
    read_at = COALESCE(read_at, now())
  WHERE conversation_id = p_conversation_id
    AND receiver_id = auth.uid()
    AND (
      read = false
      OR read_at IS NULL
    );

END;
$$;


GRANT EXECUTE
ON FUNCTION public.mark_conversation_read(uuid)
TO authenticated;


-- ------------------------------------------------------------
-- 12. GET UNREAD COUNTS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_unread_message_counts()
RETURNS TABLE (
  conversation_id uuid,
  unread_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    m.conversation_id,
    COUNT(*)::bigint AS unread_count
  FROM public.messages m
  WHERE m.receiver_id = auth.uid()
    AND (
      m.read = false
      OR m.read_at IS NULL
    )
  GROUP BY m.conversation_id;
$$;


GRANT EXECUTE
ON FUNCTION public.get_unread_message_counts()
TO authenticated;


-- ------------------------------------------------------------
-- 13. HARDEN CONVERSATION RLS
-- ------------------------------------------------------------

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  "Users can view their conversations"
ON public.conversations;

DROP POLICY IF EXISTS
  "Users can create conversations"
ON public.conversations;

CREATE POLICY
  "messaging_users_can_view_conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  participant1_id = auth.uid()
  OR participant2_id = auth.uid()
);


-- ------------------------------------------------------------
-- 14. HARDEN MESSAGE RLS
-- ------------------------------------------------------------

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  "Users can view their own messages"
ON public.messages;

DROP POLICY IF EXISTS
  "Users can send messages"
ON public.messages;

DROP POLICY IF EXISTS
  "Users can update read status of received messages"
ON public.messages;

DROP POLICY IF EXISTS
  "Users can view messages in their conversations"
ON public.messages;

CREATE POLICY
  "messaging_users_can_view_messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (
        c.participant1_id = auth.uid()
        OR c.participant2_id = auth.uid()
      )
  )
);


-- Direct INSERT/UPDATE is intentionally not granted.
-- Sending and read-state changes go through validated RPCs.


REVOKE INSERT
ON public.messages
FROM authenticated;

REVOKE UPDATE
ON public.messages
FROM authenticated;


-- ------------------------------------------------------------
-- 15. REALTIME
-- ------------------------------------------------------------

ALTER TABLE public.messages
REPLICA IDENTITY FULL;

ALTER TABLE public.conversations
REPLICA IDENTITY FULL;


DO $$
BEGIN

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN

    EXECUTE
      'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';

  END IF;


  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
  ) THEN

    EXECUTE
      'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations';

  END IF;

END $$;


COMMIT;