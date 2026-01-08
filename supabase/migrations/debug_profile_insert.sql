-- Debug Profile Insertion
-- This script helps identify why user profiles are not being created.

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_meta JSONB;
BEGIN
  -- 1. Find the most recent user who is missing a profile
  SELECT id, email, raw_user_meta_data 
  INTO v_user_id, v_email, v_meta
  FROM auth.users 
  WHERE id NOT IN (SELECT id FROM public.user_profiles)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '✅ No missing profiles found. All users have profiles.';
    RETURN;
  END IF;

  RAISE NOTICE '🔍 Attempting to create profile for user: % (Email: %)', v_user_id, v_email;

  BEGIN
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (
      v_user_id, 
      COALESCE(v_meta->>'full_name', 'Debug User'),
      COALESCE(v_meta->>'role', 'employee')
    );
    RAISE NOTICE '✅ Success! Profile created successfully for %', v_email;
  
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR DETECTED!';
    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'Error Code: %', SQLSTATE;
    RAISE NOTICE 'Error Message: %', SQLERRM;
    RAISE NOTICE 'Context: Not available';
    RAISE NOTICE '---------------------------------------------------';
  END;
END $$;
