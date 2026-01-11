-- Create businesses table for business registration
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT,
  country TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_verified BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- INSERT: Users can only create businesses for themselves
CREATE POLICY "Users can create their own businesses"
ON public.businesses
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- SELECT: Users can view their own businesses
CREATE POLICY "Users can view their own businesses"
ON public.businesses
FOR SELECT
USING (auth.uid() = owner_id);

-- UPDATE: Users can only update their own businesses
CREATE POLICY "Users can update their own businesses"
ON public.businesses
FOR UPDATE
USING (auth.uid() = owner_id);

-- Public can view active businesses (for business pages)
CREATE POLICY "Anyone can view active businesses"
ON public.businesses
FOR SELECT
USING (status = 'active');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_industry ON public.businesses(industry);