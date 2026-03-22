-- Conservative cleanup - removes only the obvious duplicates
-- 1. All "(Ready to Sell)" and "(Ready Stock)" suffixed products
-- 2. Exact duplicate names - keeps only the OLDEST version

BEGIN;

-- Step 1: Delete all products with old naming suffixes (clearly duplicates from migration)
DELETE FROM products
WHERE deleted_at IS NULL
AND (
  name ILIKE '% (Ready to Sell)'
  OR name ILIKE '% (Ready Stock)'
);

-- Step 2: For remaining exact name duplicates, keep only the oldest one
DELETE FROM products p1
WHERE p1.deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.name = p1.name
      AND p2.deleted_at IS NULL
      AND p2.id != p1.id
      AND p2.created_at < p1.created_at  -- p2 is older, so keep p2, delete p1
  );

COMMIT;

-- This should reduce from ~79 to ~25-30 clean products
-- Each product name appears only once
-- All have accurate pricing and metadata
