-- BizBase Business OS: operational tables for the next connected workflows.
-- Apply this migration to the linked Supabase project before enabling the related UI.

CREATE TABLE IF NOT EXISTS public.business_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.business_customers(id) ON DELETE SET NULL,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','confirmed','fulfilled','cancelled')),
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, order_number)
);

CREATE TABLE IF NOT EXISTS public.business_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.business_orders(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.business_products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  rate numeric(14,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done','cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date date,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.business_team_members(id) ON DELETE CASCADE,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','half_day','leave')),
  check_in timestamptz,
  check_out timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS public.business_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.business_team_members(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage business orders" ON public.business_orders
FOR ALL TO authenticated USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE POLICY "Team can manage order items" ON public.business_order_items
FOR ALL TO authenticated USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE POLICY "Team can manage tasks" ON public.business_tasks
FOR ALL TO authenticated USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE POLICY "Team can manage attendance" ON public.business_attendance
FOR ALL TO authenticated USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE POLICY "Team can manage leave requests" ON public.business_leave_requests
FOR ALL TO authenticated USING (public.can_manage_business(business_id, auth.uid()))
WITH CHECK (public.can_manage_business(business_id, auth.uid()));

CREATE INDEX IF NOT EXISTS business_orders_business_idx ON public.business_orders(business_id, order_date DESC);
CREATE INDEX IF NOT EXISTS business_order_items_order_idx ON public.business_order_items(order_id);
CREATE INDEX IF NOT EXISTS business_tasks_business_idx ON public.business_tasks(business_id, status, due_date);
CREATE INDEX IF NOT EXISTS business_attendance_business_date_idx ON public.business_attendance(business_id, work_date DESC);
CREATE INDEX IF NOT EXISTS business_leave_business_idx ON public.business_leave_requests(business_id, start_date);

DROP TRIGGER IF EXISTS update_business_orders_updated_at ON public.business_orders;
CREATE TRIGGER update_business_orders_updated_at BEFORE UPDATE ON public.business_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_tasks_updated_at ON public.business_tasks;
CREATE TRIGGER update_business_tasks_updated_at BEFORE UPDATE ON public.business_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_leave_requests_updated_at ON public.business_leave_requests;
CREATE TRIGGER update_business_leave_requests_updated_at BEFORE UPDATE ON public.business_leave_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
