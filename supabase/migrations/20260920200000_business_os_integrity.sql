-- BizBase Business OS integrity fixes: avoid double-counting sales as cash income.
-- Order fulfillment changes inventory and operational state. Revenue/cash is recognized when an invoice is paid.

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
    SELECT COALESCE(stock_quantity,0) INTO available
    FROM public.business_products
    WHERE id=item.product_id AND business_id=ord.business_id
    FOR UPDATE;
    IF available < item.quantity THEN RAISE EXCEPTION 'Insufficient stock for %', item.description; END IF;
    UPDATE public.business_products
    SET stock_quantity=available-item.quantity, updated_at=now()
    WHERE id=item.product_id AND business_id=ord.business_id;
    INSERT INTO public.business_inventory_movements(business_id,product_id,movement_type,quantity,reference_type,reference_id,note)
    VALUES(ord.business_id,item.product_id,'sale',-item.quantity,'order',ord.id,'Order fulfilled ' || ord.order_number);
  END LOOP;

  UPDATE public.business_orders SET status='fulfilled', updated_at=now() WHERE id=ord.id;
  INSERT INTO public.business_activities(business_id,actor_id,entity_type,entity_id,action,detail)
  VALUES(ord.business_id,auth.uid(),'order',ord.id,'fulfilled','Order fulfilled: ' || ord.order_number);
  RETURN jsonb_build_object('status','fulfilled');
END;
$$;

GRANT EXECUTE ON FUNCTION public.fulfill_business_order(uuid) TO authenticated;
