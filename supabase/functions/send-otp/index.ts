
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
    const { data: otpCode, error: otpError } = await supabase.rpc('send_otp_email', {
      user_email: email,
      otp_purpose: purpose
    });

    if (otpError) {
      throw otpError;
    }

    console.log(`OTP generated for ${email}`);

    // Check if we have Resend API key to send actual emails
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Send actual email using Resend
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "BizBase <noreply@resend.dev>",
            to: [email],
            subject: "BizBase - Email Verification Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #3b82f6; margin: 0;">BizBase</h1>
                  <p style="color: #666; margin: 5px 0;">Your Business Management Platform</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
                  <h2 style="color: #1e293b; margin-bottom: 20px;">Email Verification</h2>
                  <p style="color: #475569; margin-bottom: 30px;">
                    Please use the following 6-digit code to verify your email address:
                  </p>
                  
                  <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px;">
                      ${otpCode}
                    </span>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                    This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <p style="color: #94a3b8; font-size: 12px;">
                    © 2024 BizBase. All rights reserved.
                  </p>
                </div>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error("Resend API error:", errorData);
          throw new Error(`Failed to send email: ${errorData}`);
        }

        const emailData = await emailResponse.json();
        console.log("Email sent successfully via Resend:", emailData);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP sent successfully to your email"
          }), 
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );

      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Fallback to console log if email fails
        console.log(`EMAIL FALLBACK - OTP for ${email}: ${otpCode}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP generated (email service unavailable)",
            note: "Check console for OTP - email service needs configuration"
          }), 
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
    } else {
      // No email service configured - log to console for testing
      console.log(`EMAIL TO: ${email}`);
      console.log(`SUBJECT: BizBase - Email Verification Code`);
      console.log(`OTP CODE: ${otpCode}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully"
        }), 
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

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
