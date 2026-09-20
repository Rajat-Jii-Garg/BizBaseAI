-- Billing integrity: bind Razorpay payments to the business/order and make verification idempotent.
CREATE TABLE IF NOT EXISTS public.business_subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text UNIQUE,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can view subscription payments" ON public.business_subscription_payments;
CREATE POLICY "Owners can view subscription payments" ON public.business_subscription_payments
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id=business_id AND b.owner_id=auth.uid()));
CREATE INDEX IF NOT EXISTS business_subscription_payments_business_idx ON public.business_subscription_payments(business_id, created_at DESC);
GRANT SELECT ON public.business_subscription_payments TO authenticated;
GRANT ALL ON public.business_subscription_payments TO service_role;
