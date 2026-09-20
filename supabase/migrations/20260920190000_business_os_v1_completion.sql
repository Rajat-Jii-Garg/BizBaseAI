-- BizBase Business OS V1 completion: purchasing, stock ledger, billing state and atomic sales operations.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS plan_name text NOT NULL DEFAULT 'Business',
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;

UPDATE public.businesses
SET trial_ends_at = COALESCE(trial_ends_at, created_at + interval '14 days')
WHERE trial_ends_at IS NULL;

ALTER TABLE public.business_products
  ADD COLUMN IF NOT EXISTS reorder_level integer NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS public.business_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  tax_number text,
  address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.business_suppliers(id) ON DELETE SET NULL,
  purchase_number text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('draft','ordered','received','cancelled')),
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, purchase_number)
);

CREATE TABLE IF NOT EXISTS public.business_purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.business_purchases(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.business_products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  rate numeric(14,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.business_products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('opening','purchase','sale','adjustment')),
  quantity numeric(14,2) NOT NULL,
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.business_invoices(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL DEFAULT 'cash',
  reference text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can manage suppliers" ON public.business_suppliers;
CREATE POLICY "Team can manage suppliers" ON public.business_suppliers FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

DROP POLICY IF EXISTS "Team can manage purchases" ON public.business_purchases;
CREATE POLICY "Team can manage purchases" ON public.business_purchases FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

DROP POLICY IF EXISTS "Team can manage purchase items" ON public.business_purchase_items;
CREATE POLICY "Team can manage purchase items" ON public.business_purchase_items FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

DROP POLICY IF EXISTS "Team can manage inventory movements" ON public.business_inventory_movements;
CREATE POLICY "Team can manage inventory movements" ON public.business_inventory_movements FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

DROP POLICY IF EXISTS "Team can manage payments" ON public.business_payments;
CREATE POLICY "Team can manage payments" ON public.business_payments FOR ALL TO authenticated
USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE INDEX IF NOT EXISTS business_suppliers_business_idx ON public.business_suppliers(business_id, name);
CREATE INDEX IF NOT EXISTS business_purchases_business_idx ON public.business_purchases(business_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS business_purchase_items_purchase_idx ON public.business_purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS business_inventory_movements_product_idx ON public.business_inventory_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS business_payments_invoice_idx ON public.business_payments(invoice_id, paid_at DESC);

DROP TRIGGER IF EXISTS update_business_suppliers_updated_at ON public.business_suppliers;
CREATE TRIGGER update_business_suppliers_updated_at BEFORE UPDATE ON public.business_suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_business_purchases_updated_at ON public.business_purchases;
CREATE TRIGGER update_business_purchases_updated_at BEFORE UPDATE ON public.business_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic invoice payment: one payment row + invoice balance + finance income.
CREATE OR REPLACE FUNCTION public.record_business_invoice_payment(
  _invoice_id uuid,
  _amount numeric,
  _payment_method text DEFAULT 'cash',
  _reference text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.business_invoices%ROWTYPE;
  payment_id uuid;
  new_paid numeric;
  new_status text;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be greater than zero'; END IF;
  SELECT * INTO inv FROM public.business_invoices WHERE id = _invoice_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT public.can_manage_business(inv.business_id, auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _amount > (inv.total - COALESCE(inv.amount_paid,0)) + 0.01 THEN RAISE EXCEPTION 'Payment exceeds outstanding balance'; END IF;

  new_paid := COALESCE(inv.amount_paid,0) + _amount;
  new_status := CASE WHEN new_paid >= inv.total - 0.01 THEN 'paid' ELSE 'sent' END;

  INSERT INTO public.business_payments(business_id, invoice_id, amount, payment_method, reference, created_by)
  VALUES(inv.business_id, inv.id, _amount, COALESCE(_payment_method,'cash'), _reference, auth.uid())
  RETURNING id INTO payment_id;

  UPDATE public.business_invoices
  SET amount_paid = new_paid, status = new_status, updated_at = now()
  WHERE id = inv.id;

  INSERT INTO public.business_transactions(business_id,type,amount,description,category,date,invoice_number,payment_method,status)
  VALUES(inv.business_id,'income',_amount,'Payment received for invoice ' || inv.invoice_number,'Sales',CURRENT_DATE,inv.invoice_number,COALESCE(_payment_method,'cash'),'completed');

  INSERT INTO public.business_activities(business_id,actor_id,entity_type,entity_id,action,detail)
  VALUES(inv.business_id,auth.uid(),'invoice',inv.id,'payment', 'Payment received: ' || inv.invoice_number || ' (' || _amount::text || ')');

  RETURN jsonb_build_object('payment_id', payment_id, 'amount_paid', new_paid, 'status', new_status);
END;
$$;

-- Atomic purchase receiving: adds stock and creates inventory ledger rows.
CREATE OR REPLACE FUNCTION public.receive_business_purchase(_purchase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pur public.business_purchases%ROWTYPE;
  item record;
BEGIN
  SELECT * INTO pur FROM public.business_purchases WHERE id = _purchase_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase not found'; END IF;
  IF NOT public.can_manage_business(pur.business_id, auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF pur.status = 'received' THEN RETURN jsonb_build_object('status','received'); END IF;

  FOR item IN SELECT * FROM public.business_purchase_items WHERE purchase_id = pur.id AND product_id IS NOT NULL LOOP
    UPDATE public.business_products
    SET stock_quantity = COALESCE(stock_quantity,0) + item.quantity, updated_at = now()
    WHERE id = item.product_id AND business_id = pur.business_id;
    INSERT INTO public.business_inventory_movements(business_id,product_id,movement_type,quantity,reference_type,reference_id,note)
    VALUES(pur.business_id,item.product_id,'purchase',item.quantity,'purchase',pur.id,'Purchase received ' || pur.purchase_number);
  END LOOP;

  UPDATE public.business_purchases SET status='received', updated_at=now() WHERE id=pur.id;
  INSERT INTO public.business_transactions(business_id,type,amount,description,category,date,status)
  VALUES(pur.business_id,'expense',pur.total,'Purchase ' || pur.purchase_number,'Purchases',pur.purchase_date,'completed');
  INSERT INTO public.business_activities(business_id,actor_id,entity_type,entity_id,action,detail)
  VALUES(pur.business_id,auth.uid(),'purchase',pur.id,'received','Purchase received: ' || pur.purchase_number);
  RETURN jsonb_build_object('status','received');
END;
$$;

-- Atomic order fulfillment: deducts stock and creates sales ledger rows.
CREATE OR REPLACE FUNCTION public.fulfill_business_order(_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ord public.business_orders%ROWTYPE;
  item record;
  available numeric;
BEGIN
  SELECT * INTO ord FROM public.business_orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF NOT public.can_manage_business(ord.business_id, auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF ord.status = 'fulfilled' THEN RETURN jsonb_build_object('status','fulfilled'); END IF;

  FOR item IN SELECT * FROM public.business_order_items WHERE order_id = ord.id AND product_id IS NOT NULL LOOP
    SELECT COALESCE(stock_quantity,0) INTO available FROM public.business_products WHERE id=item.product_id AND business_id=ord.business_id FOR UPDATE;
    IF available < item.quantity THEN RAISE EXCEPTION 'Insufficient stock for %', item.description; END IF;
    UPDATE public.business_products SET stock_quantity=available-item.quantity, updated_at=now()
    WHERE id=item.product_id AND business_id=ord.business_id;
    INSERT INTO public.business_inventory_movements(business_id,product_id,movement_type,quantity,reference_type,reference_id,note)
    VALUES(ord.business_id,item.product_id,'sale',-item.quantity,'order',ord.id,'Order fulfilled ' || ord.order_number);
  END LOOP;

  UPDATE public.business_orders SET status='fulfilled', updated_at=now() WHERE id=ord.id;
  INSERT INTO public.business_transactions(business_id,type,amount,description,category,date,status)
  VALUES(ord.business_id,'income',ord.total,'Order ' || ord.order_number,'Sales',ord.order_date,'completed');
  INSERT INTO public.business_activities(business_id,actor_id,entity_type,entity_id,action,detail)
  VALUES(ord.business_id,auth.uid(),'order',ord.id,'fulfilled','Order fulfilled: ' || ord.order_number);
  RETURN jsonb_build_object('status','fulfilled');
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_business_invoice_payment(uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.receive_business_purchase(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_business_order(uuid) TO authenticated;
