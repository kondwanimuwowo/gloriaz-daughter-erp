-- Fix User Visibility and RLS Policies

-- 1. Enable RLS on user_profiles to ensure consistent behavior
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Profiles are visible to all authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- 3. Create permissive retrieval policy (ERP context: employees need to see each other)
CREATE POLICY "Profiles are visible to all authenticated users"
ON public.user_profiles FOR SELECT
TO authenticated
USING (true);

-- 4. Create update policies
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

-- 5. Create admin override (assuming admin role check is needed, but for now let's rely on app logic or add a check)
-- Ideally we check role='admin', but recursive policies can be tricky. 
-- For now, let's allow users to update themselves, and rely on the service_role (which bypasses RLS) for admin actions if possible.
-- BUT authService uses the standard client.

-- Let's add a policy that allows updates if the *requesting user* has role 'admin'.
-- Note: This causes infinite recursion if we query the table itself to check the role.
-- Solution: Use a JWT claim or a separate helper function, OR just stick to basic policies for now.
-- Simplest for now: Users update self. Admin updates via dashboard usually use a special query or arguably should have a backend function.
-- BUT wait, the UI allows changing roles.

-- Let's define a policy using a subquery wrapper or just trust the app for now if we can't easily check claims.
-- Better approach: "All authenticated users can select" (done).
-- Update: Users can update own.
-- What about Admin updating others?
-- We can use: USING ( (auth.uid() = id) OR (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')) )
-- This is the recursion trap. 

-- Workaround: Secure function or JWT claims.
-- For this "Debugging" session, let's keep it simple. If we need Admin powers, we usually need a function.
-- However, let's check if there is a 'service_role' client involved or if the user is using the standard client.
-- The authService uses `supabase` (standard).
-- So we DO need a policy for admins.

-- To avoid recursion, we can fetch the role from auth.users metadata if it's synced there.
-- The trigger synced it initially.
-- auth.jwt() -> 'user_metadata' ->> 'role' is often available.

CREATE POLICY "Admins can update any profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
  OR 
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 6. Grant basic permissions again just in case
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
