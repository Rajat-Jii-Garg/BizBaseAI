// import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };

// interface WelcomeEmailRequest {
//   email: string;
//   fullName: string;
// }

// const handler = async (req: Request): Promise<Response> => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     const { email, fullName }: WelcomeEmailRequest = await req.json();
    
//     console.log(`Sending welcome email to: ${email} for ${fullName}`);

//     // Check if we have Resend API key to send actual emails
//     const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
//     if (resendApiKey) {
//       // Send actual email using Resend
//       try {
//         const emailResponse = await fetch("https://api.resend.com/emails", {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${resendApiKey}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             from: "BizBase <welcome@resend.dev>",
//             to: [email],
//             subject: "Welcome to BizBase - Your Business Journey Starts Here!",
//             html: `
//               <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
//                 <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
//                   <div style="text-align: center; margin-bottom: 30px;">
//                     <h1 style="color: #3b82f6; margin: 0; font-size: 36px; font-weight: bold;">BizBase</h1>
//                     <p style="color: #666; margin: 5px 0; font-size: 16px;">Your All-In-One AI Powered Business Platform</p>
//                   </div>
                  
//                   <div style="text-align: center; margin-bottom: 30px;">
//                     <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 28px;">Welcome to BizBase, ${fullName}! 🎉</h2>
//                     <p style="color: #475569; font-size: 18px; line-height: 1.6;">
//                       Congratulations! Your account has been successfully created. You're now part of the BizBase community.
//                     </p>
//                   </div>
                  
//                   <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin: 30px 0;">
//                     <h3 style="color: #1e293b; margin-bottom: 20px; text-align: center;">🚀 What's Next?</h3>
//                     <ul style="color: #475569; padding-left: 20px; line-height: 1.8;">
//                       <li><strong>Complete Your Profile:</strong> Add your professional details, skills, and experience</li>
//                       <li><strong>Connect with Others:</strong> Build your professional network</li>
//                       <li><strong>Explore Business Tools:</strong> Discover AI-powered features to grow your business</li>
//                       <li><strong>Join Events:</strong> Participate in networking and learning opportunities</li>
//                       <li><strong>Share Your Journey:</strong> Post updates and engage with the community</li>
//                     </ul>
//                   </div>
                  
//                   <div style="text-align: center; margin: 30px 0;">
//                     <a href="https://bizbase-ai.lovable.app/dashboard" 
//                        style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
//                       Get Started Now
//                     </a>
//                   </div>
                  
//                   <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
//                     <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
//                       Need help? Contact us at support@bizbase.com or visit our help center.
//                     </p>
//                   </div>
//                 </div>
                
//                 <div style="text-align: center; margin-top: 20px;">
//                   <p style="color: rgba(255,255,255,0.8); font-size: 12px;">
//                     © 2024 BizBase. All rights reserved.
//                   </p>
//                 </div>
//               </div>
//             `
//           })
//         });

//         if (!emailResponse.ok) {
//           const errorData = await emailResponse.text();
//           console.error("Resend API error:", errorData);
//           throw new Error(`Failed to send welcome email: ${errorData}`);
//         }

//         const emailData = await emailResponse.json();
//         console.log("Welcome email sent successfully via Resend:", emailData);

//         return new Response(
//           JSON.stringify({ 
//             success: true, 
//             message: "Welcome email sent successfully"
//           }), 
//           {
//             status: 200,
//             headers: { "Content-Type": "application/json", ...corsHeaders }
//           }
//         );

//       } catch (emailError) {
//         console.error("Welcome email sending error:", emailError);
        
//         return new Response(
//           JSON.stringify({ 
//             success: false, 
//             message: "Failed to send welcome email",
//             error: emailError.message
//           }), 
//           {
//             status: 500,
//             headers: { "Content-Type": "application/json", ...corsHeaders }
//           }
//         );
//       }
//     } else {
//       // No email service configured - log to console for testing
//       console.log(`WELCOME EMAIL TO: ${email}`);
//       console.log(`RECIPIENT: ${fullName}`);
//       console.log(`SUBJECT: Welcome to BizBase - Your Business Journey Starts Here!`);

//       return new Response(
//         JSON.stringify({ 
//           success: true, 
//           message: "Welcome email logged (email service not configured)"
//         }), 
//         {
//           status: 200,
//           headers: { "Content-Type": "application/json", ...corsHeaders }
//         }
//       );
//     }

//   } catch (error: any) {
//     console.error("Error in send-welcome-email function:", error);
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json", ...corsHeaders }
//       }
//     );
//   }
// };

// serve(handler);