
-- 1. Add slug column
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS jobs_slug_unique ON public.jobs(slug) WHERE slug IS NOT NULL;

-- 2. Slug generator function
CREATE OR REPLACE FUNCTION public.generate_job_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  suffix text;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW;
  END IF;
  base := lower(regexp_replace(coalesce(NEW.title,'job') || '-' || coalesce(NEW.company_name,'co'), '[^a-zA-Z0-9]+', '-', 'g'));
  base := regexp_replace(base, '(^-+|-+$)', '', 'g');
  base := substring(base, 1, 80);
  suffix := substring(replace(NEW.id::text, '-', ''), 1, 8);
  NEW.slug := base || '-' || suffix;
  RETURN NEW;
END;
$$;

-- 3. Trigger on insert
DROP TRIGGER IF EXISTS trg_generate_job_slug ON public.jobs;
CREATE TRIGGER trg_generate_job_slug
BEFORE INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.generate_job_slug();

-- 4. Backfill existing jobs
UPDATE public.jobs
SET slug = regexp_replace(
  regexp_replace(
    lower(coalesce(title,'job') || '-' || coalesce(company_name,'co') || '-' || substring(replace(id::text,'-',''),1,8)),
    '[^a-zA-Z0-9]+', '-', 'g'
  ),
  '(^-+|-+$)', '', 'g'
)
WHERE slug IS NULL;

-- 5. Bump cron schedule from every 6h to every 2h
DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'sync-external-jobs-every-6h';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'sync-external-jobs-every-2h';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

SELECT cron.schedule(
  'sync-external-jobs-every-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ahdtenixvhgncwaglxui.supabase.co/functions/v1/sync-external-jobs',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZHRlbml4dmhnbmN3YWdseHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Nzc0NDQsImV4cCI6MjA2NjI1MzQ0NH0.M-LSVKzyxhi6RVy5p--z-_8JInImPuclzJn1DM8fQjA'),
    body := jsonb_build_object('trigger','cron')
  );
  $$
);

-- 6. Add SELECT policy so anonymous visitors can read active jobs (for public detail pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='jobs' AND policyname='Public can view active jobs'
  ) THEN
    CREATE POLICY "Public can view active jobs"
      ON public.jobs FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;
