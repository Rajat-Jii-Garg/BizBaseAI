import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: string;
}

// Per-email rate limiter to prevent brute-force
const attemptMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60_000; // 15 minutes
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attemptMap.get(key);
  if (!entry || now > entry.resetAt) {
    attemptMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, purpose }: VerifyOTPRequest = await req.json();

    if (!email || !otp || !purpose || typeof email !== 'string' || typeof otp !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const rateKey = `${email.toLowerCase()}:${purpose}`;
    if (isRateLimited(rateKey)) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      "https://ahdtenixvhgncwaglxui.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: isValid, error } = await supabase.rpc('verify_otp', {
      user_email: email,
      provided_otp: otp,
      otp_purpose: purpose
    });

    if (error) {
      throw error;
    }

    if (isValid) {
      // Reset rate limit on success
      attemptMap.delete(rateKey);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: isValid,
        message: isValid ? "OTP verified successfully" : "Invalid or expired OTP"
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
