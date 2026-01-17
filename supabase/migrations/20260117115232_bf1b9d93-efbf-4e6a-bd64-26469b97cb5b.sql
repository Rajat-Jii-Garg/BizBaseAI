-- Create business_services table
CREATE TABLE public.business_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration TEXT,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_projects table
CREATE TABLE public.business_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_team_members table
CREATE TABLE public.business_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL,
  department TEXT,
  permissions JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_leads table (for CRM)
CREATE TABLE public.business_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  source TEXT,
  notes TEXT,
  value DECIMAL(12, 2),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_transactions table (for Finance)
CREATE TABLE public.business_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  invoice_number TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_services
CREATE POLICY "Business owners can manage their services"
ON public.business_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_services.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active services"
ON public.business_services
FOR SELECT
USING (is_active = true);

-- RLS Policies for business_projects
CREATE POLICY "Business owners can manage their projects"
ON public.business_projects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_projects.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Team members can view business projects"
ON public.business_projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_team_members 
    WHERE business_team_members.business_id = business_projects.business_id 
    AND business_team_members.user_id = auth.uid()
    AND business_team_members.status = 'active'
  )
);

-- RLS Policies for business_team_members
CREATE POLICY "Business owners can manage team members"
ON public.business_team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_team_members.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Team members can view their colleagues"
ON public.business_team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_team_members AS self
    WHERE self.business_id = business_team_members.business_id 
    AND self.user_id = auth.uid()
    AND self.status = 'active'
  )
);

-- RLS Policies for business_leads
CREATE POLICY "Business owners can manage leads"
ON public.business_leads
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_leads.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Team members can view and update assigned leads"
ON public.business_leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_team_members 
    WHERE business_team_members.business_id = business_leads.business_id 
    AND business_team_members.user_id = auth.uid()
    AND business_team_members.status = 'active'
  )
);

-- RLS Policies for business_transactions
CREATE POLICY "Business owners can manage transactions"
ON public.business_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_transactions.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Team members with finance permission can view transactions"
ON public.business_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_team_members 
    WHERE business_team_members.business_id = business_transactions.business_id 
    AND business_team_members.user_id = auth.uid()
    AND business_team_members.status = 'active'
    AND (business_team_members.permissions->>'finance')::boolean = true
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_business_services_business_id ON public.business_services(business_id);
CREATE INDEX idx_business_projects_business_id ON public.business_projects(business_id);
CREATE INDEX idx_business_team_members_business_id ON public.business_team_members(business_id);
CREATE INDEX idx_business_team_members_user_id ON public.business_team_members(user_id);
CREATE INDEX idx_business_leads_business_id ON public.business_leads(business_id);
CREATE INDEX idx_business_leads_status ON public.business_leads(status);
CREATE INDEX idx_business_transactions_business_id ON public.business_transactions(business_id);
CREATE INDEX idx_business_transactions_date ON public.business_transactions(date);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_business_services_updated_at
BEFORE UPDATE ON public.business_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_projects_updated_at
BEFORE UPDATE ON public.business_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_leads_updated_at
BEFORE UPDATE ON public.business_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_transactions_updated_at
BEFORE UPDATE ON public.business_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();