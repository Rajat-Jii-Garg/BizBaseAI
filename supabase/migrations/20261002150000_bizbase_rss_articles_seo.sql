-- BizBase: automated RSS -> editorial articles -> SEO publishing pipeline

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS vault;

-- Existing blog_posts are public editorial articles. Automated articles do not
-- need to impersonate a human user, so author_id becomes nullable and a clear
-- editorial author label is stored separately.
ALTER TABLE public.blog_posts
  ALTER COLUMN author_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'BizBase Editorial Desk',
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_key TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Global',
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_ai_assisted BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_source_key_unique
  ON public.blog_posts(source_key)
  WHERE source_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS blog_posts_published_created_idx
  ON public.blog_posts(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS blog_posts_category_idx
  ON public.blog_posts(category, created_at DESC);

CREATE INDEX IF NOT EXISTS blog_posts_source_published_idx
  ON public.blog_posts(source_published_at DESC);

-- Lightweight run log so scheduled ingestion is observable and retryable.
CREATE TABLE IF NOT EXISTS public.article_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  candidates_count INTEGER NOT NULL DEFAULT 0,
  published_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.article_ingestion_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'article_ingestion_runs'
      AND policyname = 'Admins can view article ingestion runs'
  ) THEN
    CREATE POLICY "Admins can view article ingestion runs"
      ON public.article_ingestion_runs
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

GRANT ALL ON public.article_ingestion_runs TO service_role;

-- Public-safe atomic view counter for published articles.
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_post_id AND is_published = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO anon, authenticated;


-- The cron job invokes the Edge Function with a secret stored in Supabase Vault.
-- Before this schedule can execute successfully, create these two Vault secrets:
--   project_url       = https://ahdtenixvhgncwaglxui.supabase.co
--   publishable_key   = your Supabase publishable/anon key
-- The Edge Function itself also needs ARTICLE_CRON_SECRET set as an Edge Function secret.
-- Store the exact same value in Vault as article_cron_secret.

DO $$
DECLARE
  job_id BIGINT;
BEGIN
  SELECT jobid INTO job_id
  FROM cron.job
  WHERE jobname = 'bizbase-rss-articles-every-4h';

  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $$;

SELECT cron.schedule(
  'bizbase-rss-articles-every-4h',
  '0 */4 * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/generate-rss-articles',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'publishable_key'),
        'x-article-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'article_cron_secret')
      ),
      body := jsonb_build_object('limit', 1, 'trigger', 'cron')
    ) AS request_id;
  $$
);
