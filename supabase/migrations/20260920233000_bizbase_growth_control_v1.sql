-- BizBase Growth Control V1
-- Focus: business pulse, lead leakage, 7-day growth plans, campaigns, usage metering.

ALTER TABLE public.businesses
  ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '30 days');

ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS follow_up_status text NOT NULL DEFAULT 'not_scheduled'
    CHECK (follow_up_status IN ('not_scheduled','scheduled','completed','overdue','paused')),
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS campaign_id uuid;

CREATE TABLE IF NOT EXISTS public.business_growth_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  objective text NOT NULL,
  audience text,
  offer text,
  plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, week_start)
);

CREATE TABLE IF NOT EXISTS public.business_growth_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  growth_plan_id uuid REFERENCES public.business_growth_plans(id) ON DELETE SET NULL,
  name text NOT NULL,
  objective text,
  audience text,
  offer text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','paused','completed')),
  tracking_code text UNIQUE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  usage_type text NOT NULL,
  units numeric(14,4) NOT NULL DEFAULT 1 CHECK (units > 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL,
  detail text,
  entity_type text,
  entity_id uuid,
  action_path text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bizbase_sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  website text,
  phone text,
  whatsapp text,
  industry text,
  challenge text,
  source text DEFAULT 'growth_audit',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','demo','won','lost')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_growth_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bizbase_sales_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can manage growth plans" ON public.business_growth_plans;
CREATE POLICY "Team can manage growth plans" ON public.business_growth_plans FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid())) WITH CHECK (public.can_manage_business(business_id, auth.uid()));
DROP POLICY IF EXISTS "Team can manage growth campaigns" ON public.business_growth_campaigns;
CREATE POLICY "Team can manage growth campaigns" ON public.business_growth_campaigns FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid())) WITH CHECK (public.can_manage_business(business_id, auth.uid()));
DROP POLICY IF EXISTS "Team can view usage events" ON public.business_usage_events;
CREATE POLICY "Team can view usage events" ON public.business_usage_events FOR SELECT TO authenticated
USING (public.can_manage_business(business_id, auth.uid()));
DROP POLICY IF EXISTS "Team can create usage events" ON public.business_usage_events;
CREATE POLICY "Team can create usage events" ON public.business_usage_events FOR INSERT TO authenticated
WITH CHECK (public.can_manage_business(business_id, auth.uid()));
DROP POLICY IF EXISTS "Team can manage business alerts" ON public.business_alerts;
CREATE POLICY "Team can manage business alerts" ON public.business_alerts FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid())) WITH CHECK (public.can_manage_business(business_id, auth.uid()));
DROP POLICY IF EXISTS "Public can create BizBase sales leads" ON public.bizbase_sales_leads;
CREATE POLICY "Public can create BizBase sales leads" ON public.bizbase_sales_leads FOR INSERT TO anon, authenticated
WITH CHECK (char_length(trim(business_name)) >= 2);
DROP POLICY IF EXISTS "Admins can view BizBase sales leads" ON public.bizbase_sales_leads;
CREATE POLICY "Admins can view BizBase sales leads" ON public.bizbase_sales_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS business_growth_plans_business_idx ON public.business_growth_plans(business_id, week_start DESC);
CREATE INDEX IF NOT EXISTS business_growth_campaigns_business_idx ON public.business_growth_campaigns(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS business_usage_events_business_idx ON public.business_usage_events(business_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS business_alerts_business_idx ON public.business_alerts(business_id, resolved_at, created_at DESC);
CREATE INDEX IF NOT EXISTS business_leads_followup_idx ON public.business_leads(business_id, follow_up_status, next_follow_up_at);
CREATE INDEX IF NOT EXISTS bizbase_sales_leads_status_idx ON public.bizbase_sales_leads(status, created_at DESC);

DROP TRIGGER IF EXISTS update_business_growth_plans_updated_at ON public.business_growth_plans;
CREATE TRIGGER update_business_growth_plans_updated_at BEFORE UPDATE ON public.business_growth_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_business_growth_campaigns_updated_at ON public.business_growth_campaigns;
CREATE TRIGGER update_business_growth_campaigns_updated_at BEFORE UPDATE ON public.business_growth_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public-safe tracking URL helper. It does not expose business data.
CREATE OR REPLACE FUNCTION public.business_campaign_click(_tracking_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c public.business_growth_campaigns%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.business_growth_campaigns WHERE tracking_code = _tracking_code LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
  RETURN jsonb_build_object('ok',true,'business_id',c.business_id,'campaign_id',c.id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.business_campaign_click(text) TO anon, authenticated;


-- V1.1 reliability + security hardening
ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS follow_up_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_follow_up_at timestamptz;

CREATE INDEX IF NOT EXISTS business_leads_business_status_followup_idx
  ON public.business_leads(business_id, status, next_follow_up_at);

DROP POLICY IF EXISTS "Public can read growth audit leads" ON public.bizbase_sales_leads;

-- Keep public tracking intentionally narrow: return only routing identifiers.
REVOKE ALL ON FUNCTION public.business_campaign_click(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.business_campaign_click(text) TO anon, authenticated;

-- Never expose usage-event writes to anonymous clients.
REVOKE ALL ON public.business_usage_events FROM anon;
GRANT SELECT, INSERT ON public.business_usage_events TO authenticated;

-- 30-day trial for newly created businesses; existing subscription state is preserved.
ALTER TABLE public.businesses
  ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '30 days');


-- Ensure the core business tables participate in Supabase Realtime.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'businesses','business_leads','business_customers','business_invoices',
    'business_transactions','business_products','business_projects',
    'business_activities','business_growth_plans','business_growth_campaigns',
    'business_alerts','business_team_members'
  ] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END $$;
