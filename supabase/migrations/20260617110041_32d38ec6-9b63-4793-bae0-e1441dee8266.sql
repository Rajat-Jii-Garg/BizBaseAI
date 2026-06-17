ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_seed_bot boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_seed_bot ON public.profiles(is_seed_bot) WHERE is_seed_bot = true;

CREATE TABLE IF NOT EXISTS public.seed_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.seed_post_logs TO authenticated;
GRANT ALL ON public.seed_post_logs TO service_role;
ALTER TABLE public.seed_post_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages seed logs" ON public.seed_post_logs FOR ALL TO service_role USING (true) WITH CHECK (true);