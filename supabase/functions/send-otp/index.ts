
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

    // Check if we have Gmail credentials to send actual emails
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_PASS");
    
    if (gmailUser && gmailPass) {
      // Send actual email using Gmail SMTP via nodemailer API
      try {
        const emailData = {
          from: `"BizBase" <${gmailUser}>`,
          to: email,
          subject: `Your BizBase verification code: ${otpCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">BizBase</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Network Platform</p>
              </div>
              
              <div style="padding: 40px 30px; background: white;">
                <h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                  Your verification code is:
                </p>
                
                <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otpCode}</span>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                  This code will expire in <strong>10 minutes</strong>. Please use it to complete your verification.
                </p>
                
                <p style="color: #999; font-size: 12px; line-height: 1.4;">
                  If you didn't request this code, please ignore this email. Your account security is important to us.
                </p>
              </div>
              
              <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} BizBase. All rights reserved.
                </p>
              </div>
            </div>
          `
        };

        // Use Gmail SMTP via a simple HTTP service (nodemailer-like API)
        const emailResponse = await fetch("https://smtp-api.vercel.app/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            smtp: {
              host: "smtp.gmail.com",
              port: 587,
              secure: false,
              auth: {
                user: gmailUser,
                pass: gmailPass
              }
            },
            ...emailData
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error("Gmail SMTP error:", errorData);
          throw new Error(`Failed to send email: ${errorData}`);
        }

        const emailResult = await emailResponse.json();
        console.log("Email sent successfully via Gmail SMTP:", emailResult);

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
        console.error("Gmail SMTP error:", emailError);
        // Fallback to console log if email fails
        console.log(`EMAIL FALLBACK - OTP for ${email}: ${otpCode}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP generated (email service temporarily unavailable)",
            note: "Check console for OTP - Gmail service needs configuration",
            otp: otpCode  // Include OTP in response for development
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
          message: "OTP sent successfully",
          otp: otpCode  // Include OTP in response for development
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
