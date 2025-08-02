-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'full-time', -- full-time, part-time, contract, freelance, internship
  work_mode TEXT NOT NULL DEFAULT 'on-site', -- remote, on-site, hybrid
  experience_level TEXT NOT NULL DEFAULT 'mid-level', -- entry-level, mid-level, senior-level, executive
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  benefits TEXT[],
  application_deadline DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Employers can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = employer_id);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  applicant_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewing, shortlisted, interview, hired, rejected
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for job applications
CREATE POLICY "Users can apply for jobs" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can view applications for their jobs" 
ON public.job_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);

CREATE POLICY "Employers can update application status" 
ON public.job_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);

-- Create saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  user_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for saved jobs
CREATE POLICY "Users can save jobs" 
ON public.saved_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their saved jobs" 
ON public.saved_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove saved jobs" 
ON public.saved_jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update job application counts
CREATE OR REPLACE FUNCTION public.update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs 
    SET applications_count = applications_count - 1 
    WHERE id = OLD.job_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job application counts
CREATE TRIGGER update_job_applications_count
AFTER INSERT OR DELETE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_job_application_count();

-- Create function to update job views
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.jobs 
  SET views_count = views_count + 1 
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample jobs for testing
INSERT INTO public.jobs (
  employer_id, 
  title, 
  company_name, 
  location, 
  job_type, 
  work_mode, 
  experience_level, 
  industry, 
  description, 
  requirements, 
  skills_required, 
  salary_min, 
  salary_max, 
  benefits
) VALUES 
(
  '00000000-0000-0000-0000-000000000000', -- placeholder employer_id
  'Senior Software Engineer',
  'TechCorp Solutions',
  'San Francisco, CA',
  'full-time',
  'hybrid',
  'senior-level',
  'Technology',
  'We are looking for a Senior Software Engineer to join our dynamic team and help build cutting-edge applications.',
  ARRAY['Bachelor''s degree in Computer Science or related field', '5+ years of software development experience', 'Experience with modern web technologies'],
  ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
  120000,
  180000,
  ARRAY['Health Insurance', 'Dental Insurance', '401k Matching', 'Flexible PTO', 'Remote Work Options']
),
(
  '00000000-0000-0000-0000-000000000000',
  'Marketing Manager',
  'Growth Marketing Inc',
  'New York, NY',
  'full-time',
  'on-site',
  'mid-level',
  'Marketing',
  'Join our marketing team to lead digital marketing campaigns and drive customer acquisition.',
  ARRAY['Bachelor''s degree in Marketing or related field', '3+ years of marketing experience', 'Experience with digital marketing tools'],
  ARRAY['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media'],
  70000,
  100000,
  ARRAY['Health Insurance', 'Dental Insurance', 'Paid Time Off', 'Professional Development Budget']
),
(
  '00000000-0000-0000-0000-000000000000',
  'Product Designer',
  'Design Studio Pro',
  'Remote',
  'full-time',
  'remote',
  'mid-level',
  'Design',
  'We''re seeking a talented Product Designer to create exceptional user experiences for our digital products.',
  ARRAY['Bachelor''s degree in Design or related field', '3+ years of product design experience', 'Portfolio demonstrating UX/UI skills'],
  ARRAY['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing'],
  80000,
  120000,
  ARRAY['Health Insurance', 'Equipment Allowance', 'Flexible Schedule', 'Learning Budget']
);