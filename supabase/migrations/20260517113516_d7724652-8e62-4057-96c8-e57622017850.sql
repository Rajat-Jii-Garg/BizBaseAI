
-- 1. Schema changes on jobs
ALTER TABLE public.jobs
  ALTER COLUMN employer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS external_url text;

-- 2. Dedup index for external jobs
CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_external_id_unique
  ON public.jobs (source, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS jobs_source_idx ON public.jobs (source);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at DESC);

-- 3. Public read policy for external jobs (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='jobs' AND policyname='External jobs are viewable by everyone'
  ) THEN
    CREATE POLICY "External jobs are viewable by everyone"
      ON public.jobs FOR SELECT
      USING (source <> 'internal' AND is_active = true);
  END IF;
END$$;

-- 4. Extensions for scheduled cron HTTP call
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
