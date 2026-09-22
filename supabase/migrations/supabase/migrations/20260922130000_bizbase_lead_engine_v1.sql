-- BizBase Lead Engine V1
-- Run after existing business OS migrations.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS lead_capture_token text;

UPDATE public.businesses
SET lead_capture_token = encode(gen_random_bytes(18), 'hex')
WHERE lead_capture_token IS NULL;

ALTER TABLE public.businesses
  ALTER COLUMN lead_capture_token SET DEFAULT encode(gen_random_bytes(18), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS businesses_lead_capture_token_idx
  ON public.businesses(lead_capture_token);

CREATE TABLE IF NOT EXISTS public.business_lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('call','whatsapp','email','note','status_change')),
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can manage lead activities" ON public.business_lead_activities;
CREATE POLICY "Team can manage lead activities"
ON public.business_lead_activities FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE INDEX IF NOT EXISTS business_lead_activities_lead_idx
  ON public.business_lead_activities(lead_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.capture_public_business_lead(
  p_token text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_source text DEFAULT 'website'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_id uuid;
  v_lead_id uuid;
BEGIN
  SELECT id INTO v_business_id
  FROM public.businesses
  WHERE lead_capture_token = trim(p_token)
  LIMIT 1;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Invalid lead form';
  END IF;

  IF char_length(trim(coalesce(p_name,''))) < 2 THEN
    RAISE EXCEPTION 'Name is required';
  END IF;

  IF char_length(trim(coalesce(p_phone,''))) < 7
     AND char_length(trim(coalesce(p_email,''))) < 5 THEN
    RAISE EXCEPTION 'Phone or email is required';
  END IF;

  INSERT INTO public.business_leads
    (business_id, name, phone, email, status, stage, source, notes)
  VALUES
    (v_business_id, trim(p_name), nullif(trim(p_phone),''), nullif(trim(p_email),''),
     'new', 'new', nullif(trim(p_source), ''),
     nullif(trim(p_message), ''))
  RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;

REVOKE ALL ON FUNCTION public.capture_public_business_lead(text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.capture_public_business_lead(text,text,text,text,text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_business_lead_activity(
  p_lead_id uuid,
  p_type text,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_business_id uuid;
  v_activity_id uuid;
BEGIN
  SELECT business_id INTO v_business_id FROM public.business_leads WHERE id = p_lead_id;
  IF v_business_id IS NULL OR NOT public.can_manage_business(v_business_id, auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  INSERT INTO public.business_lead_activities
    (business_id, lead_id, activity_type, note, created_by)
  VALUES
    (v_business_id, p_lead_id, p_type, p_note, auth.uid())
  RETURNING id INTO v_activity_id;

  IF p_type IN ('call','whatsapp','email') THEN
    UPDATE public.business_leads
    SET last_contacted_at = now(),
        last_follow_up_at = now(),
        follow_up_count = coalesce(follow_up_count,0) + 1,
        follow_up_status = 'contacted',
        status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
        updated_at = now()
    WHERE id = p_lead_id;
  END IF;

  RETURN v_activity_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_business_lead_activity(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_public_business_lead_form(p_token text)
RETURNS TABLE(id uuid, name text, logo_url text, industry text, username text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.name, b.logo_url, b.industry, b.username
  FROM public.businesses b
  WHERE b.lead_capture_token = trim(p_token)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_business_lead_form(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_business_lead_form(text) TO anon, authenticated;
