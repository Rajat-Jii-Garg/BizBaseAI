
-- Restore broad SELECT so existing components keep working, but use column-level
-- privileges so sensitive PII columns are NOT readable by other users on the raw table.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Column-level security: revoke direct column access to PII for the authenticated role,
-- then grant access only to the non-sensitive columns. Owners can still read their own
-- email/phone/location via the public_profiles view (which checks auth.uid() = id).
REVOKE SELECT ON public.profiles FROM authenticated, anon;

GRANT SELECT (
  id, bio, website, linkedin_url, twitter_url, github_url,
  current_position, industry, education, experience_years,
  skills, achievements, resume_url, portfolio_url,
  actively_looking_for_work, profile_completion_score,
  personal_branding_score, bizcoins, followers_count, following_count,
  posts_count, banner_url, nickname, profession, about, belongs_to,
  total_profile_views, this_month_views, is_verified, username,
  referral_code, referred_by, power_score,
  show_email, show_phone, show_location,
  full_name, profile_completed, avatar_url, company_name, business_type,
  subscription_plan, created_at, updated_at, email_verified
) ON public.profiles TO authenticated, anon;

-- Owners need full access including PII to read their own row directly.
-- We grant the sensitive columns; RLS still restricts which row they can see for those cols.
-- But because column GRANT is role-wide, we instead expose PII solely through:
--   (a) public_profiles view (for everyone, masked by privacy flags including owner override), and
--   (b) explicit owner self-fetch through public_profiles where show_* logic returns the value to the owner.
-- The public_profiles view already returns email/phone/location to the owner via CASE WHEN auth.uid() = id.

GRANT SELECT ON public.public_profiles TO authenticated, anon;
