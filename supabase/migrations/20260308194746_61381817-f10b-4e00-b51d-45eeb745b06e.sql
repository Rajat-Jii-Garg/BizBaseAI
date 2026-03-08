
-- Fix infinite recursion in business_team_members RLS
-- Drop the recursive policy
DROP POLICY IF EXISTS "Team members can view their colleagues" ON public.business_team_members;

-- Recreate using a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_business_team_member(_business_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_team_members
    WHERE business_id = _business_id
      AND user_id = _user_id
      AND status = 'active'
  )
$$;

-- Recreate the policy using the function
CREATE POLICY "Team members can view their colleagues"
ON public.business_team_members
FOR SELECT
TO authenticated
USING (
  public.is_business_team_member(business_id, auth.uid())
);

-- Also fix the team member policies on other tables that reference business_team_members
DROP POLICY IF EXISTS "Team members can view and update assigned leads" ON public.business_leads;
CREATE POLICY "Team members can view and update assigned leads"
ON public.business_leads
FOR SELECT
TO authenticated
USING (
  public.is_business_team_member(business_id, auth.uid())
);

DROP POLICY IF EXISTS "Team members can view business projects" ON public.business_projects;
CREATE POLICY "Team members can view business projects"
ON public.business_projects
FOR SELECT
TO authenticated
USING (
  public.is_business_team_member(business_id, auth.uid())
);

DROP POLICY IF EXISTS "Team members with finance permission can view transactions" ON public.business_transactions;
CREATE POLICY "Team members with finance permission can view transactions"
ON public.business_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.business_team_members
    WHERE business_team_members.business_id = business_transactions.business_id
      AND business_team_members.user_id = auth.uid()
      AND business_team_members.status = 'active'
      AND (business_team_members.permissions->>'finance')::boolean = true
  )
);
