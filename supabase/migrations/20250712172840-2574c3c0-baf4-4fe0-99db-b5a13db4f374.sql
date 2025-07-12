
-- Add endorsements table for skill endorsements
CREATE TABLE public.endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID REFERENCES auth.users NOT NULL,
  endorsed_user_id UUID REFERENCES auth.users NOT NULL,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(endorser_id, endorsed_user_id, skill)
);

-- Add RLS policies for endorsements
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view endorsements" ON public.endorsements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create endorsements" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can delete their own endorsements" ON public.endorsements
  FOR DELETE USING (auth.uid() = endorser_id);

-- Add new columns to profiles table for enhanced features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS actively_looking_for_work BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_branding_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bizcoins INTEGER DEFAULT 0;

-- Create function to calculate profile completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic info (10 points each)
  IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN score := score + 10; END IF;
  IF profile_record.email IS NOT NULL AND LENGTH(profile_record.email) > 0 THEN score := score + 10; END IF;
  IF profile_record.phone IS NOT NULL AND LENGTH(profile_record.phone) > 0 THEN score := score + 10; END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(profile_record.location) > 0 THEN score := score + 10; END IF;
  
  -- Professional info (15 points each)
  IF profile_record.current_position IS NOT NULL AND LENGTH(profile_record.current_position) > 0 THEN score := score + 15; END IF;
  IF profile_record.company_name IS NOT NULL AND LENGTH(profile_record.company_name) > 0 THEN score := score + 15; END IF;
  IF profile_record.industry IS NOT NULL AND LENGTH(profile_record.industry) > 0 THEN score := score + 15; END IF;
  
  -- Detailed info (15 points each)
  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN score := score + 15; END IF;
  
  -- Skills and achievements (20 points if has at least 3)
  IF jsonb_array_length(COALESCE(profile_record.skills, '[]'::jsonb)) >= 3 THEN score := score + 20; END IF;
  
  RETURN LEAST(score, 100);
END;
$$;

-- Create trigger to auto-update profile completion score
CREATE OR REPLACE FUNCTION public.update_profile_completion_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completion_score := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profile_completion ON public.profiles;
CREATE TRIGGER update_profile_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion_trigger();
