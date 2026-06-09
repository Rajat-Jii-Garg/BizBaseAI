-- AI Profile Coach: opt-out flag, last-sent tracking, log table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_coach_emails_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_ai_coach_email_at timestamptz;

CREATE TABLE IF NOT EXISTS public.ai_coach_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  profile_score integer,
  suggestions jsonb,
  email_status text DEFAULT 'sent',
  error_message text
);

GRANT SELECT ON public.ai_coach_email_logs TO authenticated;
GRANT ALL ON public.ai_coach_email_logs TO service_role;

ALTER TABLE public.ai_coach_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach logs"
  ON public.ai_coach_email_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_coach_logs_user ON public.ai_coach_email_logs(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_coach_due ON public.profiles(last_ai_coach_email_at) WHERE ai_coach_emails_enabled = true;

-- Schedule weekly run (Mondays 09:00 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('profile-ai-coach-weekly');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'profile-ai-coach-weekly',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://ahdtenixvhgncwaglxui.supabase.co/functions/v1/profile-ai-coach',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZHRlbml4dmhnbmN3YWdseHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Nzc0NDQsImV4cCI6MjA2NjI1MzQ0NH0.M-LSVKzyxhi6RVy5p--z-_8JInImPuclzJn1DM8fQjA"}'::jsonb,
    body := jsonb_build_object('trigger','cron','time', now())
  );
  $$
);