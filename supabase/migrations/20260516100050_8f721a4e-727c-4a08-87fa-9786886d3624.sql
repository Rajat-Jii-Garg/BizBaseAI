
-- 1. LEADS table: admin-only access (no owner column exists)
DROP POLICY IF EXISTS "Admins can manage leads" ON public."LEADS";
CREATE POLICY "Admins can manage leads"
ON public."LEADS"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. businesses: restrict directory browsing to authenticated users (hides email/phone from anonymous)
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
CREATE POLICY "Authenticated users can view active businesses"
ON public.businesses
FOR SELECT
TO authenticated
USING (status = 'active');

-- 3. notifications: remove client-side INSERT so only SECURITY DEFINER triggers create notifications
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;

-- 4. Realtime topic-scoped policies for connections, conversations, call_signals
-- SELECT
CREATE POLICY "rt_connections_participants"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'connection:%' THEN EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.requester_id = auth.uid() OR c.addressee_id = auth.uid())
    )
    ELSE false
  END
);

CREATE POLICY "rt_conversations_participants"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'conversations:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    ELSE false
  END
);

CREATE POLICY "rt_call_signals_participants"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'call_signal:%' THEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = split_part(realtime.topic(), ':', 2)
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
    ELSE false
  END
);
