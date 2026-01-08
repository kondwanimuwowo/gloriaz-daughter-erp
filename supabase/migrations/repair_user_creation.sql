-- Repair User Creation Trigger
-- This migration fixes issues with the handle_new_user trigger causing 500 errors on sign up.

-- 1. Ensure public schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Ensure user_profiles table exists and has correct permissions
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'employee',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on user_profiles
GRANT ALL ON public.user_profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
-- Note: INSERT is done by the trigger which is SECURITY DEFINER, so authenticated users don't need direct INSERT permission on this table usually. 
-- But keeping it restricted is safer.

-- 3. Redefine the handle_new_user function with better error handling and robustness
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role VARCHAR(50);
  v_full_name VARCHAR(255);
BEGIN
  -- Extract metadata safely
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  v_full_name := NEW.raw_user_meta_data->>'full_name';

  -- Log for debugging (visible in Supabase logs)
  RAISE LOG 'Handling new user: % (Role: %)', NEW.id, v_role;

  -- Insert profile with conflict handling
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    v_full_name,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- In case of error, log it prominently
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  -- We return NEW so the auth user creation succeeds even if profile creation fails.
  -- This prevents the 500 error blocks. 
  -- The app can then handle the missing profile (or we can fix it manually).
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper: If any users exist without profiles, create them now (Backfill)
INSERT INTO public.user_profiles (id, full_name, role)
SELECT 
  id, 
  raw_user_meta_data->>'full_name',
  COALESCE(raw_user_meta_data->>'role', 'employee')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;
