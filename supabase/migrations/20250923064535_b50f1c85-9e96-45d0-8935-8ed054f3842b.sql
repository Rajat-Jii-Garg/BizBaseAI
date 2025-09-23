-- Create additional tables for the comprehensive profile system

-- Skills table with levels
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  endorsements_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Experience table
CREATE TABLE IF NOT EXISTS public.user_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Education table
CREATE TABLE IF NOT EXISTS public.user_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  grade TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS public.user_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE NOT NULL,
  category TEXT DEFAULT 'General',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Languages table
CREATE TABLE IF NOT EXISTS public.user_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL DEFAULT 'Beginner' CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Native')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profile views tracking
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skills
CREATE POLICY "Users can view all skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON public.user_skills 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_experience  
CREATE POLICY "Users can view all experience" ON public.user_experience FOR SELECT USING (true);
CREATE POLICY "Users can manage their own experience" ON public.user_experience 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_education
CREATE POLICY "Users can view all education" ON public.user_education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON public.user_education 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_certificates
CREATE POLICY "Users can view all certificates" ON public.user_certificates FOR SELECT USING (true);
CREATE POLICY "Users can manage their own certificates" ON public.user_certificates 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage their own achievements" ON public.user_achievements 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_languages
CREATE POLICY "Users can view all languages" ON public.user_languages FOR SELECT USING (true);
CREATE POLICY "Users can manage their own languages" ON public.user_languages 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for profile_views
CREATE POLICY "Users can view their profile views" ON public.profile_views 
  FOR SELECT USING (auth.uid() = profile_user_id);
CREATE POLICY "Users can create profile views" ON public.profile_views 
  FOR INSERT WITH CHECK (auth.uid() = viewer_user_id OR viewer_user_id IS NULL);

-- Update profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS belongs_to TEXT,
ADD COLUMN IF NOT EXISTS total_profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS this_month_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Update existing profiles RLS to allow public viewing
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_experience_updated_at
  BEFORE UPDATE ON public.user_experience
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_education_updated_at
  BEFORE UPDATE ON public.user_education
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_certificates_updated_at
  BEFORE UPDATE ON public.user_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();