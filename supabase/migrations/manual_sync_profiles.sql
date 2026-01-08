-- Manual Sync Profiles
-- This script manually creates profiles for any users that exist in the auth system 
-- but are missing from the public.user_profiles table.

DO $$
DECLARE
  r RECORD;
  inserted_count INTEGER := 0;
BEGIN
  FOR r IN 
    SELECT * FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.user_profiles)
  LOOP
    BEGIN
      INSERT INTO public.user_profiles (id, full_name, role, active)
      VALUES (
        r.id,
        COALESCE(r.raw_user_meta_data->>'full_name', 'System User'),
        COALESCE(r.raw_user_meta_data->>'role', 'employee'),
        TRUE
      );
      inserted_count := inserted_count + 1;
      RAISE NOTICE 'Created profile for user: %', r.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create profile for %: %', r.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Total profiles created: %', inserted_count;
END $$;
