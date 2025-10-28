-- Fix RLS policy for communities table to allow users to create multiple communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;

-- Create correct RLS policy for community creation
CREATE POLICY "Authenticated users can create communities" 
ON public.communities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Remove unique constraint on user_id to allow users to create multiple communities
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_user_id_key;

-- Ensure the communities table has the correct structure
ALTER TABLE public.communities ALTER COLUMN user_id SET NOT NULL;