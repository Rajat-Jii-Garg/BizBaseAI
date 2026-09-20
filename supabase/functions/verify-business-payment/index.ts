import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

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
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    const { business_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!business_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw new Error("Payment verification data missing");

    const { data: business } = await client.from("businesses").select("id,owner_id").eq("id", business_id).single();
    if (!business || business.owner_id !== userData.user.id) throw new Error("Not allowed");

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (!secret || !keyId) throw new Error("Razorpay is not configured");
    const expected = createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) throw new Error("Invalid payment signature");

    const orderAuth = btoa(`${keyId}:${secret}`);
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, { headers: { Authorization: `Basic ${orderAuth}` } });
    const razorpayOrder = await orderResponse.json();
    if (!orderResponse.ok) throw new Error("Could not verify Razorpay order");
    if (Number(razorpayOrder.amount) !== 500000 || razorpayOrder.currency !== "INR") throw new Error("Invalid payment amount");
    if (razorpayOrder.notes?.business_id !== business_id) throw new Error("Payment does not belong to this business");

    const { data: reservation } = await admin.from("business_subscription_payments").select("id,status,amount").eq("razorpay_order_id", razorpay_order_id).eq("business_id", business_id).maybeSingle();
    if (!reservation) throw new Error("Payment order is not registered for this business");
    if (reservation.status === "paid") return new Response(JSON.stringify({ success: true, already_processed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const started = new Date();
    const { data: currentPlan } = await admin.from("businesses").select("subscription_ends_at").eq("id", business_id).single();
    const base = currentPlan?.subscription_ends_at && new Date(currentPlan.subscription_ends_at) > started
      ? new Date(currentPlan.subscription_ends_at)
      : started;
    const ends = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { error } = await admin.from("businesses").update({
      subscription_status: "active",
      subscription_started_at: started.toISOString(),
      subscription_ends_at: ends.toISOString(),
      plan_name: "Business",
    }).eq("id", business_id);
    if (error) throw error;

    const { error: paymentUpdateError } = await admin.from("business_subscription_payments").update({
      razorpay_payment_id, status: "paid", paid_at: started.toISOString()
    }).eq("razorpay_order_id", razorpay_order_id).eq("business_id", business_id);
    if (paymentUpdateError) throw paymentUpdateError;

    await admin.from("business_activities").insert({
      business_id, actor_id: userData.user.id, entity_type: "subscription", action: "activated",
      detail: `Business plan activated through Razorpay payment ${razorpay_payment_id}`
    });

    return new Response(JSON.stringify({ success: true, subscription_ends_at: ends.toISOString() }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Payment verification failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
