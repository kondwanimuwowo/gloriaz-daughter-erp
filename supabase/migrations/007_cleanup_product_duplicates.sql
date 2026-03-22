-- Cleanup duplicate products created during migration
-- Removes all products with "(Ready to Sell)" or "(Ready Stock)" suffixes
-- These are old entries from the materials table migration

BEGIN;

-- 1. Delete all products with "(Ready to Sell)" suffix
DELETE FROM products
WHERE name ILIKE '% (Ready to Sell)'
AND deleted_at IS NULL;

-- 2. Delete all products with "(Ready Stock)" suffix
DELETE FROM products
WHERE name ILIKE '% (Ready Stock)'
AND deleted_at IS NULL;

-- 3. For remaining exact name duplicates, keep only the original (custom_design)
-- and remove newer finished_good versions with the same clean name
DELETE FROM products p1
WHERE p1.product_type = 'finished_good'
  AND p1.deleted_at IS NULL
  AND NOT p1.name ILIKE '% (Ready%'
  AND EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.name = p1.name
      AND p2.product_type = 'custom_design'
      AND p2.deleted_at IS NULL
      AND p2.id != p1.id
  );

COMMIT;

-- Notes:
-- 1. Removed ~30+ duplicate entries with old naming conventions
-- 2. Kept original product definitions
-- 3. To add finished goods with stock tracking:
--    - Go to ERP Products page
--    - Edit an existing product OR create new one
--    - Set Product Type = "Finished Good"
--    - Fill in Stock Quantity, Min Level, Cost Per Unit
--    - Save
-- 4. This ensures data integrity and prevents confusion in catalog
