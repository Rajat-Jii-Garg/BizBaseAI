REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, full_name, avatar_url, banner_url, bio, about, nickname, profession, current_position, company_name, industry, belongs_to, is_verified, skills, achievements, followers_count, following_count, posts_count, power_score, profile_completion_score, created_at) ON public.profiles TO anon;

CREATE POLICY "Public can view basic profile info"
ON public.profiles
FOR SELECT
TO anon
USING (true);