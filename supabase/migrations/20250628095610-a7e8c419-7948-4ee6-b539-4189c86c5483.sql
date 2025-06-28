
-- Create OTP verification table
CREATE TABLE public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for OTP verification
CREATE POLICY "Anyone can insert OTP" ON public.otp_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select their OTP" ON public.otp_verifications
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update their OTP" ON public.otp_verifications
  FOR UPDATE USING (true);

-- Create function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Create function to send OTP email
CREATE OR REPLACE FUNCTION public.send_otp_email(
  user_email TEXT,
  otp_purpose TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_code TEXT;
BEGIN
  -- Generate OTP
  otp_code := public.generate_otp();
  
  -- Delete any existing OTP for this email and purpose
  DELETE FROM public.otp_verifications 
  WHERE email = user_email AND purpose = otp_purpose;
  
  -- Insert new OTP
  INSERT INTO public.otp_verifications (email, otp_code, purpose)
  VALUES (user_email, otp_code, otp_purpose);
  
  RETURN otp_code;
END;
$$;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(
  user_email TEXT,
  provided_otp TEXT,
  otp_purpose TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid BOOLEAN := FALSE;
BEGIN
  -- Check if OTP is valid and not expired
  SELECT EXISTS(
    SELECT 1 FROM public.otp_verifications
    WHERE email = user_email 
    AND otp_code = provided_otp 
    AND purpose = otp_purpose
    AND expires_at > NOW()
    AND verified = FALSE
  ) INTO is_valid;
  
  -- If valid, mark as verified
  IF is_valid THEN
    UPDATE public.otp_verifications
    SET verified = TRUE
    WHERE email = user_email 
    AND otp_code = provided_otp 
    AND purpose = otp_purpose;
  END IF;
  
  RETURN is_valid;
END;
$$;

-- Update profiles table structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, email_verified)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$;
