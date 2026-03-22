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
    
    if (!email || !purpose) {
      return new Response(
        JSON.stringify({ error: "Email and purpose are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://ahdtenixvhgncwaglxui.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate and store OTP
    const { data: otpCode, error: otpError } = await supabase.rpc('send_otp_email', {
      user_email: email,
      otp_purpose: purpose
    });

    if (otpError) {
      console.error("OTP generation error:", otpError);
      throw otpError;
    }

    console.log(`OTP generated for ${email}: ${otpCode}`);

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      try {
        const purposeText = purpose === 'signup' 
          ? 'Complete your BizBase registration' 
          : purpose === 'reset_password' 
            ? 'Reset your BizBase password' 
            : 'Verify your BizBase account';

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "BizBase <onboarding@resend.dev>",
            to: [email],
            subject: `Your BizBase verification code: ${otpCode}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">BizBase</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">AI-Powered Professional Network</p>
                </div>
                
                <div style="padding: 40px 30px; background: white;">
                  <h2 style="color: #1e293b; margin-bottom: 10px; font-size: 22px;">${purposeText}</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Use the verification code below to continue. This code is valid for <strong>10 minutes</strong>.
                  </p>
                  
                  <div style="background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 10px; font-family: monospace;">${otpCode}</span>
                  </div>
                  
                  <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 24px;">
                    If you didn't request this code, you can safely ignore this email. Your account security is our priority.
                  </p>
                </div>
                
                <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} BizBase. All rights reserved.
                  </p>
                </div>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error("Resend API error:", errorData);
          // Still return success - OTP is generated, email just failed
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "OTP generated but email delivery had an issue. Please try again.",
            }), 
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        console.log("Verification email sent successfully via Resend");
        return new Response(
          JSON.stringify({ success: true, message: "Verification code sent to your email" }), 
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );

      } catch (emailError) {
        console.error("Email sending error:", emailError);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP generated (email delivery issue)",
          }), 
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // No Resend API key - fallback for development
      console.log(`[DEV] OTP for ${email}: ${otpCode}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          otp: otpCode // Only in dev when no email service
        }), 
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
