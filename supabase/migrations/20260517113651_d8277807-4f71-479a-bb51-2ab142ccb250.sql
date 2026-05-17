
-- Remove existing schedule if rerunning
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-external-jobs-every-6h') THEN
    PERFORM cron.unschedule('sync-external-jobs-every-6h');
  END IF;
END$$;

SELECT cron.schedule(
  'sync-external-jobs-every-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ahdtenixvhgncwaglxui.supabase.co/functions/v1/sync-external-jobs',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZHRlbml4dmhnbmN3YWdseHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Nzc0NDQsImV4cCI6MjA2NjI1MzQ0NH0.M-LSVKzyxhi6RVy5p--z-_8JInImPuclzJn1DM8fQjA"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
