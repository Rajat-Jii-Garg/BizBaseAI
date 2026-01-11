-- First, update the duplicate email in businesses to make it unique
UPDATE public.businesses 
SET email = 'bizbase-tech-' || SUBSTRING(id::text, 1, 8) || '@example.com',
    phone = phone || '-1'
WHERE id = 'bd4ed745-9657-4cb4-9642-df21c09889fb';

-- Add username column to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text;

-- Add unique constraint for username in profiles (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
END $$;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Add username column to businesses table if not exists
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS username text;

-- Add unique constraints for businesses (with conflict handling)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_username_unique') THEN
    ALTER TABLE public.businesses ADD CONSTRAINT businesses_username_unique UNIQUE (username);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_email_unique') THEN
    ALTER TABLE public.businesses ADD CONSTRAINT businesses_email_unique UNIQUE (email);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_phone_unique') THEN
    ALTER TABLE public.businesses ADD CONSTRAINT businesses_phone_unique UNIQUE (phone);
  END IF;
END $$;

-- Create indexes for businesses lookups
CREATE INDEX IF NOT EXISTS idx_businesses_username ON public.businesses(username);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON public.businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON public.businesses(phone);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);

-- Create a function to check global username uniqueness across users and businesses
CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(check_username)) THEN
    RETURN false;
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.businesses WHERE LOWER(username) = LOWER(check_username)) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create a function to get profile or business by username
CREATE OR REPLACE FUNCTION public.get_entity_by_username(search_username text)
RETURNS TABLE(
  entity_type text,
  entity_id uuid,
  entity_name text,
  avatar_url text,
  entity_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'user'::text as entity_type,
    p.id as entity_id,
    p.full_name as entity_name,
    p.avatar_url,
    to_jsonb(p) as entity_data
  FROM public.profiles p
  WHERE LOWER(p.username) = LOWER(search_username);
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'business'::text as entity_type,
      b.id as entity_id,
      b.name as entity_name,
      b.logo_url as avatar_url,
      to_jsonb(b) as entity_data
    FROM public.businesses b
    WHERE LOWER(b.username) = LOWER(search_username)
    AND b.status = 'active';
  END IF;
  
  RETURN;
END;
$$;

-- Create validation triggers for global username uniqueness
CREATE OR REPLACE FUNCTION public.validate_profile_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.businesses WHERE LOWER(username) = LOWER(NEW.username)
  ) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_profile_username ON public.profiles;
CREATE TRIGGER trigger_validate_profile_username
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_username();

CREATE OR REPLACE FUNCTION public.validate_business_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(NEW.username)
  ) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_business_username ON public.businesses;
CREATE TRIGGER trigger_validate_business_username
  BEFORE INSERT OR UPDATE OF username ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_business_username();