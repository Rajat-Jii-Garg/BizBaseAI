
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  purpose: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, purpose }: OTPRequest = await req.json();
    
    const supabase = createClient(
      "https://ahdtenixvhgncwaglxui.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate and store OTP
    const { data: otpData, error: otpError } = await supabase.rpc('send_otp_email', {
      user_email: email,
      otp_purpose: purpose
    });

    if (otpError) {
      throw otpError;
    }

    console.log(`OTP for ${email}: ${otpData}`);

    // For now, we'll return the OTP in response for testing
    // In production, integrate with actual email service like Resend
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        otp: otpData // Remove this in production
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Error in send-otp function:", error);
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
