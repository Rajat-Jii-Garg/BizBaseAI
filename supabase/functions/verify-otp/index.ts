
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, purpose }: VerifyOTPRequest = await req.json();
    
    const supabase = createClient(
      "https://ahdtenixvhgncwaglxui.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify OTP
    const { data: isValid, error } = await supabase.rpc('verify_otp', {
      user_email: email,
      provided_otp: otp,
      otp_purpose: purpose
    });

    if (error) {
      throw error;
    }

    if (isValid) {
      // Update user email verification status
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
