import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  username: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, phone, username, otp }: SignupRequest = await req.json();

    if (!email || !password || !fullName || !otp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://ahdtenixvhgncwaglxui.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Step 1: Verify OTP first
    const { data: isValid, error: otpError } = await supabase.rpc('verify_otp', {
      user_email: email,
      provided_otp: otp,
      otp_purpose: 'signup'
    });

    if (otpError) {
      console.error("OTP verification error:", otpError);
      return new Response(
        JSON.stringify({ error: "OTP verification failed. Please try again." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP code. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Step 2: Create user with admin API (auto-confirmed)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm since OTP is verified
      user_metadata: {
        full_name: fullName,
        phone: phone,
        username: username,
      }
    });

    if (createError) {
      console.error("User creation error:", createError);
      
      if (createError.message?.includes('already been registered') || 
          createError.message?.includes('already exists')) {
        return new Response(
          JSON.stringify({ error: "This email is already registered. Please login instead." }),
          { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: createError.message || "Failed to create account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`User created successfully: ${userData.user?.id}`);

    // Step 3: Update profile with username if provided
    if (username && userData.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          email_verified: true 
        })
        .eq('id', userData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Non-critical, continue
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully!",
        userId: userData.user?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in signup-with-verification:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
