-- =========================================================
-- BIZBASE COMMUNITY CONTENT AUTOPILOT
-- RSS -> Filter -> Gemini -> Real Community Admin -> Post
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ---------------------------------------------------------
-- Automation configuration
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_content_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  community_id UUID NOT NULL
    REFERENCES public.communities(id)
    ON DELETE CASCADE,

  -- REAL registered profile.
  -- This should normally be the community creator/admin.
  author_user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  enabled BOOLEAN NOT NULL DEFAULT true,

  topic TEXT NOT NULL,

  topic_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Example:
  -- [
  --   {"name":"TechCrunch","url":"https://techcrunch.com/feed/"},
  --   {"name":"Inc42","url":"https://inc42.com/feed/"}
  -- ]
  rss_feeds JSONB NOT NULL DEFAULT '[]'::jsonb,

  posts_per_day INTEGER NOT NULL DEFAULT 2
    CHECK (posts_per_day BETWEEN 1 AND 3),

  -- India/IST by default
  timezone_offset_minutes INTEGER NOT NULL DEFAULT 330,

  window_start_local TIME NOT NULL DEFAULT '09:00',

  window_end_local TIME NOT NULL DEFAULT '21:00',

  schedule_date DATE,

  scheduled_slots JSONB NOT NULL DEFAULT '[]'::jsonb,

  completed_slots JSONB NOT NULL DEFAULT '[]'::jsonb,

  next_run_at TIMESTAMPTZ,

  last_post_at TIMESTAMPTZ,

  last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(community_id)
);

CREATE INDEX IF NOT EXISTS
idx_community_content_automation_due
ON public.community_content_automation(enabled, next_run_at);

-- ---------------------------------------------------------
-- Run logs
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_content_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  automation_id UUID
    REFERENCES public.community_content_automation(id)
    ON DELETE SET NULL,

  community_id UUID
    REFERENCES public.communities(id)
    ON DELETE SET NULL,

  author_user_id UUID
    REFERENCES auth.users(id)
    ON DELETE SET NULL,

  source_name TEXT,

  source_url TEXT,

  source_headline TEXT,

  post_id UUID
    REFERENCES public.posts(id)
    ON DELETE SET NULL,

  status TEXT NOT NULL,

  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS
idx_community_content_logs_created
ON public.community_content_automation_logs(created_at DESC);

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------

ALTER TABLE public.community_content_automation
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.community_content_automation_logs
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
"Service role manages community automation"
ON public.community_content_automation;

CREATE POLICY
"Service role manages community automation"
ON public.community_content_automation
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS
"Admins can view community automation"
ON public.community_content_automation;

CREATE POLICY
"Admins can view community automation"
ON public.community_content_automation
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS
"Service role manages community automation logs"
ON public.community_content_automation_logs;

CREATE POLICY
"Service role manages community automation logs"
ON public.community_content_automation_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

GRANT ALL
ON public.community_content_automation
TO service_role;

GRANT ALL
ON public.community_content_automation_logs
TO service_role;

-- ---------------------------------------------------------
-- Updated_at trigger
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION
public.update_community_content_automation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
trg_community_content_automation_updated_at
ON public.community_content_automation;

CREATE TRIGGER
trg_community_content_automation_updated_at
BEFORE UPDATE ON public.community_content_automation
FOR EACH ROW
EXECUTE FUNCTION
public.update_community_content_automation_updated_at();

-- ---------------------------------------------------------
-- Remove old Supabase cron if it exists
-- ---------------------------------------------------------

DO $$
DECLARE
  old_job BIGINT;
BEGIN

  SELECT jobid
  INTO old_job
  FROM cron.job
  WHERE jobname =
    'bizbase-community-autopilot-every-5m';

  IF old_job IS NOT NULL THEN
    PERFORM cron.unschedule(old_job);
  END IF;

END $$;

-- ---------------------------------------------------------
-- New scheduler
-- Runs every 5 minutes.
-- It DOES NOT post every 5 minutes.
-- It only checks whether a configured community
-- has reached its random scheduled time.
-- ---------------------------------------------------------

SELECT cron.schedule(
  'bizbase-community-autopilot-every-5m',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ahdtenixvhgncwaglxui.supabase.co/functions/v1/community-content-autopilot',

    headers := jsonb_build_object(
      'Content-Type',
      'application/json',

      'x-community-autopilot-secret',
      (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'community_autopilot_secret'
        LIMIT 1
      )
    ),

    body := '{}'::jsonb
  );
  $$
);