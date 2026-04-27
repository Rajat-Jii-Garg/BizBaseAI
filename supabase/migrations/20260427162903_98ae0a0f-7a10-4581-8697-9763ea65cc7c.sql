-- Drop the insecure public policies on otp_verifications
DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can select their OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update their OTP" ON public.otp_verifications;

-- Deny-all policy: no direct access from clients (anon or authenticated).
-- All legitimate OTP operations go through SECURITY DEFINER functions
-- (send_otp_email, verify_otp, verify_otp_email) which bypass RLS safely.
CREATE POLICY "No direct access to OTP table"
ON public.otp_verifications
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Ensure RLS is enabled (defense in depth)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Tighten function execution: only allow server-side / authenticated use
REVOKE ALL ON FUNCTION public.send_otp_email(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_otp(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_otp_email(text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.send_otp_email(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_otp(text, text, text) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_otp_email(text, text, text) TO service_role, authenticated;