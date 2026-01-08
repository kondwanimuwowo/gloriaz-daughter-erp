-- Force Sync Profiles (V2)
-- This script tries to insert missing profiles and SHOWS the result immediately.

-- 1. Un-hide any weirdly hidden rows (Just in case RLS is messy)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- Ensure Postgres/Admins can query
DROP POLICY IF EXISTS "Admins can do everything" ON public.user_profiles;
CREATE POLICY "Admins can do everything" ON public.user_profiles 
  FOR ALL 
  TO postgres, service_role, authenticated 
  USING (true) 
  WITH CHECK (true);
-- (This is a simplified "Allow All" policy for debugging to rule out RLS completely for now)


-- 2. Insert missing users and RETURN the created rows
INSERT INTO public.user_profiles (id, full_name, role, active)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'System User'),
  COALESCE(raw_user_meta_data->>'role', 'employee'),
  TRUE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
RETURNING id, full_name, role, 'CREATED_NOW' as status;

-- 3. If the above returned NO ROWS, run this to see existing profiles:
SELECT id, full_name, role, 'ALREADY_EXISTS' as status 
FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 5;
