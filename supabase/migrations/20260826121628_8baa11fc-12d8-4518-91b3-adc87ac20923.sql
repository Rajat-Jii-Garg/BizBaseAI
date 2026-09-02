-- 1) businesses: commerce + locale fields
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS tax_mode text NOT NULL DEFAULT 'gst',
  ADD COLUMN IF NOT EXISTS default_tax_rate numeric(5,2) NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS offering_type text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS tax_number text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 2) leads pipeline
ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS expected_close_date date;

-- helper: owner or active team member
CREATE OR REPLACE FUNCTION public.can_manage_business(_business_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND b.owner_id = _user_id
  ) OR public.is_business_team_member(_business_id, _user_id)
$$;

-- 3) catalog
CREATE TABLE IF NOT EXISTS public.business_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'product',
  name text NOT NULL,
  description text,
  sku text,
  price numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  unit text DEFAULT 'unit',
  stock_quantity integer,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_products TO authenticated;
GRANT ALL ON public.business_products TO service_role;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active catalog of active businesses"
  ON public.business_products FOR SELECT
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND b.status = 'active' AND b.is_public = true
  ));
CREATE POLICY "Team can manage catalog"
  ON public.business_products FOR ALL TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()))
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE INDEX IF NOT EXISTS business_products_business_idx ON public.business_products(business_id);

-- 4) customers
CREATE TABLE IF NOT EXISTS public.business_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  tax_number text,
  billing_address text,
  city text,
  country text DEFAULT 'India',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_customers TO authenticated;
GRANT ALL ON public.business_customers TO service_role;
ALTER TABLE public.business_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage customers"
  ON public.business_customers FOR ALL TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()))
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE INDEX IF NOT EXISTS business_customers_business_idx ON public.business_customers(business_id);

-- 5) invoices
CREATE TABLE IF NOT EXISTS public.business_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.business_customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  customer_name text,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  currency text NOT NULL DEFAULT 'INR',
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  amount_paid numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_invoices TO authenticated;
GRANT ALL ON public.business_invoices TO service_role;
ALTER TABLE public.business_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage invoices"
  ON public.business_invoices FOR ALL TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()))
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE UNIQUE INDEX IF NOT EXISTS business_invoices_number_unique ON public.business_invoices(business_id, invoice_number);

CREATE TABLE IF NOT EXISTS public.business_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.business_invoices(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.business_products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  rate numeric(14,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_invoice_items TO authenticated;
GRANT ALL ON public.business_invoice_items TO service_role;
ALTER TABLE public.business_invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage invoice items"
  ON public.business_invoice_items FOR ALL TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()))
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE INDEX IF NOT EXISTS business_invoice_items_invoice_idx ON public.business_invoice_items(invoice_id);

-- 6) team invites
CREATE TABLE IF NOT EXISTS public.business_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  invited_by uuid,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_invites TO authenticated;
GRANT ALL ON public.business_invites TO service_role;
ALTER TABLE public.business_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage invites"
  ON public.business_invites FOR ALL TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()))
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE POLICY "Invitee can view own invites"
  ON public.business_invites FOR SELECT TO authenticated
  USING (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')));
CREATE POLICY "Invitee can accept own invites"
  ON public.business_invites FOR UPDATE TO authenticated
  USING (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
  WITH CHECK (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

-- 7) activity timeline
CREATE TABLE IF NOT EXISTS public.business_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.business_activities TO authenticated;
GRANT ALL ON public.business_activities TO service_role;
ALTER TABLE public.business_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view activity"
  ON public.business_activities FOR SELECT TO authenticated
  USING (public.can_manage_business(business_id, auth.uid()));
CREATE POLICY "Team can log activity"
  ON public.business_activities FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_business(business_id, auth.uid()));
CREATE INDEX IF NOT EXISTS business_activities_business_idx ON public.business_activities(business_id, created_at DESC);

-- 8) updated_at triggers
CREATE TRIGGER update_business_products_updated_at BEFORE UPDATE ON public.business_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_customers_updated_at BEFORE UPDATE ON public.business_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_invoices_updated_at BEFORE UPDATE ON public.business_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_invites_updated_at BEFORE UPDATE ON public.business_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
