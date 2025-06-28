
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

    // For demo purposes, we'll simulate sending email
    // In production, integrate with Resend, SendGrid, etc.
    console.log(`OTP for ${email}: ${otpData}`);

    // Simulate email sending
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3B82F6;">BizBase - Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937; border-radius: 8px; margin: 20px 0;">
          ${otpData}
        </div>
        <p style="color: #6B7280;">This code will expire in 10 minutes.</p>
        <p style="color: #6B7280;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

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
