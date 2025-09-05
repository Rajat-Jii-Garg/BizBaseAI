-- Fix RLS policy for communities table to allow authenticated users to create communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;

CREATE POLICY "Authenticated users can create communities" 
ON public.communities 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);