
-- 1. Profiles: add server-enforced privacy flags
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_location boolean NOT NULL DEFAULT false;

-- 2. Referrals: restrict UPDATE
DROP POLICY IF EXISTS "System can update referrals" ON public.referrals;

CREATE POLICY "Referrers can update their referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (auth.uid() = referrer_id)
WITH CHECK (auth.uid() = referrer_id);

-- 3. Notifications: restrict INSERT to authenticated callers
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. chat-files bucket: private + participant-only SELECT
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';

DROP POLICY IF EXISTS "Users can view files in their conversations" ON storage.objects;

CREATE POLICY "Users can view chat files they participate in"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE
        (c.participant1_id::text = (storage.foldername(name))[1] AND c.participant2_id = auth.uid())
        OR (c.participant2_id::text = (storage.foldername(name))[1] AND c.participant1_id = auth.uid())
    )
  )
);
