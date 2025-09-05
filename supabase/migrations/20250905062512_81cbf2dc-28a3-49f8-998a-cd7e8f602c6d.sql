-- Fix community creation RLS policy
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;

CREATE POLICY "Authenticated users can create communities" 
ON public.communities 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);