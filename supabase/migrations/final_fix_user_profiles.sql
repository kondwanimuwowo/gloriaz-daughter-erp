-- FINAL FIX: Repair User Profiles with Email
-- The previous error revealed that 'user_profiles' has a NOT NULL 'email' column.
-- This script updates the trigger and syncs data including the email.

-- 1. Update the Trigger Function to include EMAIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role VARCHAR(50);
  v_full_name VARCHAR(255);
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  v_full_name := NEW.raw_user_meta_data->>'full_name';

  INSERT INTO public.user_profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    v_full_name,
    v_role,
    NEW.email  -- <--- Added this required field
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Force Sync Missing Profiles (Now with Email)
INSERT INTO public.user_profiles (id, full_name, role, email, active)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'System User'),
  COALESCE(raw_user_meta_data->>'role', 'employee'),
  email, -- <--- Added this required field
  TRUE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email; -- Ensure email is synced if it was missing

-- 3. Ensure Visibility (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can view all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
  OR 
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR 
  email IN (SELECT email FROM auth.users WHERE id = auth.uid()) -- Fallback self-update
);

-- 4. Verify output
SELECT id, full_name, email, 'FIX_APPLIED' as status FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
