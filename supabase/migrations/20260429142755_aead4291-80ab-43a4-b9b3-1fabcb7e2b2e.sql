
-- 1) PROFILES: mask email/phone/location based on per-user visibility flags
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Helper view-like function not needed; use a column-masking SELECT policy + a safe view.
-- Simplest robust fix: keep row-level SELECT open, but create a SECURITY INVOKER view that
-- masks sensitive fields. Then update RLS so direct SELECT only returns your own row OR
-- a row where the requester is authenticated. We additionally enforce masking in the app
-- by reading from a public_profiles view.

-- Re-create a SELECT policy that requires authentication for browsing other profiles,
-- while allowing owners full access to their own row.
CREATE POLICY "Profiles selectable by authenticated users or owner"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR auth.uid() IS NOT NULL
);

-- Public masked view: only exposes email/phone/location when the owner opted in.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.full_name,
  p.username,
  p.nickname,
  p.avatar_url,
  p.banner_url,
  p.bio,
  p.about,
  p.profession,
  p.belongs_to,
  p.current_position,
  p.company_name,
  p.business_type,
  p.industry,
  p.education,
  p.experience_years,
  p.skills,
  p.achievements,
  p.website,
  p.linkedin_url,
  p.twitter_url,
  p.github_url,
  p.portfolio_url,
  p.resume_url,
  p.actively_looking_for_work,
  p.profile_completion_score,
  p.personal_branding_score,
  p.power_score,
  p.bizcoins,
  p.followers_count,
  p.following_count,
  p.posts_count,
  p.total_profile_views,
  p.this_month_views,
  p.is_verified,
  p.referral_code,
  p.show_email,
  p.show_phone,
  p.show_location,
  p.email_verified,
  p.subscription_plan,
  p.created_at,
  p.updated_at,
  CASE WHEN auth.uid() = p.id OR p.show_email  = true THEN p.email    ELSE NULL END AS email,
  CASE WHEN auth.uid() = p.id OR p.show_phone  = true THEN p.phone    ELSE NULL END AS phone,
  CASE WHEN auth.uid() = p.id OR p.show_location = true THEN p.location ELSE NULL END AS location
FROM public.profiles p;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2) NOTIFICATIONS: prevent users from creating notifications for arbitrary other users
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications about themselves"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (related_user_id IS NULL OR related_user_id = auth.uid())
);

-- 3) STORAGE: posts bucket — restrict update/delete to the uploader
DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;

CREATE POLICY "Users can update their own post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4) Lock down SECURITY DEFINER functions: revoke anonymous execute
REVOKE EXECUTE ON FUNCTION public.send_otp_email(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_otp(text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_otp_email(text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_otp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_post_hashtags(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_post_mentions(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_bizcoins(uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_bizcoins(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decay_user_interests() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_job_views(uuid) FROM PUBLIC, anon;

-- Keep these callable for app features
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_entity_by_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_business_team_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_job_views(uuid) TO authenticated;

-- 5) Set fixed search_path on functions that were missing it
ALTER FUNCTION public.generate_otp() SET search_path = public;
ALTER FUNCTION public.send_otp_email(text, text) SET search_path = public;
ALTER FUNCTION public.verify_otp(text, text, text) SET search_path = public;
ALTER FUNCTION public.verify_otp_email(text, text, text) SET search_path = public;
ALTER FUNCTION public.create_notification(uuid, text, text, text, uuid, uuid) SET search_path = public;
ALTER FUNCTION public.update_repost_count() SET search_path = public;
ALTER FUNCTION public.update_job_application_count() SET search_path = public;
ALTER FUNCTION public.update_post_counts() SET search_path = public;
ALTER FUNCTION public.update_community_member_count() SET search_path = public;
ALTER FUNCTION public.calculate_profile_completion(uuid) SET search_path = public;
ALTER FUNCTION public.update_profile_completion_trigger() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_post_like_notification() SET search_path = public;
ALTER FUNCTION public.handle_post_comment_notification() SET search_path = public;
ALTER FUNCTION public.handle_post_share_notification() SET search_path = public;
ALTER FUNCTION public.handle_connection_notification() SET search_path = public;
ALTER FUNCTION public.handle_follow_notification() SET search_path = public;
ALTER FUNCTION public.handle_repost_notification() SET search_path = public;
ALTER FUNCTION public.handle_event_attendee_notification() SET search_path = public;
ALTER FUNCTION public.handle_job_application_notification() SET search_path = public;
ALTER FUNCTION public.handle_community_join_notification() SET search_path = public;
ALTER FUNCTION public.process_post_hashtags(uuid, text) SET search_path = public;
ALTER FUNCTION public.process_post_mentions(uuid, text) SET search_path = public;
ALTER FUNCTION public.increment_job_views(uuid) SET search_path = public;
