-- 1) Lock down Realtime channel subscriptions: only authenticated users
--    can subscribe to topics they are a participant in.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "rt_authenticated_only" ON realtime.messages;
DROP POLICY IF EXISTS "rt_conversation_participants" ON realtime.messages;
DROP POLICY IF EXISTS "rt_call_participants" ON realtime.messages;
DROP POLICY IF EXISTS "rt_user_own_topic" ON realtime.messages;
DROP POLICY IF EXISTS "rt_block_anon" ON realtime.messages;

-- Helper: extract topic
-- realtime.topic() returns text of the channel name like "conversation:<uuid>"

-- Conversation channels: only the two participants
CREATE POLICY "rt_conversation_participants"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    WHEN realtime.topic() LIKE 'call:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    WHEN realtime.topic() LIKE 'user:%' THEN
      split_part(realtime.topic(), ':', 2) = auth.uid()::text
    WHEN realtime.topic() LIKE 'notifications:%' THEN
      split_part(realtime.topic(), ':', 2) = auth.uid()::text
    WHEN realtime.topic() LIKE 'public:%' THEN true
    ELSE false
  END
);

CREATE POLICY "rt_send_conversation_participants"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    WHEN realtime.topic() LIKE 'call:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    WHEN realtime.topic() LIKE 'user:%' THEN
      split_part(realtime.topic(), ':', 2) = auth.uid()::text
    WHEN realtime.topic() LIKE 'public:%' THEN true
    ELSE false
  END
);

-- 2) Remove businesses table from realtime publication so row-change events
--    are not broadcast to all authenticated subscribers.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'businesses'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.businesses';
  END IF;
END $$;