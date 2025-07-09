
-- Update profiles RLS policy to allow users to view other profiles (for networking)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policy that allows authenticated users to view all profiles
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Keep the existing update policy for own profile only
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
