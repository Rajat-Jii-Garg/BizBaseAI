
-- 1. PROFILES: restrict raw table SELECT to owner only
DROP POLICY IF EXISTS "Profiles selectable by authenticated users or owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Ensure public_profiles view is accessible to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 2. NOTIFICATIONS: prevent cross-user inbox injection
DROP POLICY IF EXISTS "Users can create notifications about themselves" ON public.notifications;

CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND ((related_user_id IS NULL) OR (related_user_id = auth.uid()))
);

-- 3. STORAGE: posts bucket INSERT must be folder-scoped
DROP POLICY IF EXISTS "Authenticated users can upload to posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own posts folder" ON storage.objects;

CREATE POLICY "Users can upload to their own posts folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
