import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    const { business_id } = await req.json();
    if (!business_id) throw new Error("business_id is required");

    const { data: business, error } = await userClient.from("businesses").select("id,name,owner_id").eq("id", business_id).single();
    if (error || !business) throw new Error("Business not found");
    if (business.owner_id !== userData.user.id) throw new Error("Only the business owner can upgrade");

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) throw new Error("Razorpay is not configured");

    const authHeader = btoa(`${keyId}:${keySecret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${authHeader}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500000, currency: "INR", receipt: `bizbase_${business.id}_${Date.now()}`, notes: { business_id: business.id, user_id: userData.user.id } }),
    });
    const order = await response.json();
    if (!response.ok) throw new Error(order?.error?.description || "Could not create payment order");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: recordError } = await admin.from("business_subscription_payments").insert({
      business_id: business.id, razorpay_order_id: order.id, amount: 5000, currency: "INR", status: "created"
    });
    if (recordError) throw new Error("Could not reserve payment order");

    return new Response(JSON.stringify({ order, key_id: keyId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Payment order failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
