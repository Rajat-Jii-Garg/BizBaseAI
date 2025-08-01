-- First, let's check if we need to add any missing secrets for email functionality
-- Also ensure we have a proper verify-otp edge function

-- Create the verify-otp edge function if it doesn't exist
CREATE OR REPLACE FUNCTION public.verify_otp_email(user_email text, provided_otp text, otp_purpose text)
RETURNS boolean
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