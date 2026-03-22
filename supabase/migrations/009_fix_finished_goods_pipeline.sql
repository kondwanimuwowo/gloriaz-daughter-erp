-- =============================================================
-- FIX: Finished Goods Pipeline
-- =============================================================
-- Problem: Two competing pathways (DB trigger + JS service) both
-- created broken entries in the materials table. This migration:
--
-- 1. Cleans the products table back to unique custom designs
-- 2. Rebuilds finished goods FROM completed production batches
-- 3. Disables the old DB trigger (JS service will handle it)
-- =============================================================

BEGIN;

-- =============================================================
-- STEP 1: Clean slate — remove ALL finished goods from products
-- (We will rebuild them from production_batches, the true source)
-- =============================================================

DELETE FROM products
WHERE product_type = 'finished_good';

-- Also remove any "(Ready to Sell)" or "(Ready Stock)" leftovers
DELETE FROM products
WHERE name ILIKE '% (Ready to Sell)'
   OR name ILIKE '% (Ready Stock)'
   OR name ILIKE '% (Finished)';

-- Remove exact-name duplicates among custom_designs, keep oldest
DELETE FROM products p1
WHERE p1.deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.name = p1.name
      AND p2.deleted_at IS NULL
      AND p2.id != p1.id
      AND p2.created_at < p1.created_at
  );

-- =============================================================
-- STEP 2: Rebuild finished goods from completed production batches
--
-- For each completed batch:
--   - If the original product still exists → update it in-place
--     (add stock_quantity, set product_type to finished_good,
--      set cost_per_unit from production materials)
--   - If multiple batches for same product → SUM their quantities
--
-- Logic: A product that has completed batches IS a finished good
--        with stock. Its base_price (selling price) is already set.
-- =============================================================

-- First, update existing products that have completed batches
-- Set them as finished_good with aggregated stock from all their batches
UPDATE products p
SET
  product_type = 'finished_good',
  stock_quantity = batch_totals.total_quantity,
  cost_per_unit = batch_totals.avg_cost,
  min_stock_level = COALESCE(p.min_stock_level, 10),
  active = true
FROM (
  SELECT
    pb.product_id,
    SUM(pb.quantity) AS total_quantity,
    COALESCE(
      -- Average cost per unit across all completed batches
      (SELECT SUM(pm.cost) FROM production_materials pm
       JOIN production_batches pb2 ON pm.batch_id = pb2.id
       WHERE pb2.product_id = pb.product_id AND pb2.status = 'completed')
      / NULLIF(SUM(pb.quantity), 0),
      0
    ) AS avg_cost
  FROM production_batches pb
  WHERE pb.status = 'completed'
    AND pb.product_id IS NOT NULL
  GROUP BY pb.product_id
) AS batch_totals
WHERE p.id = batch_totals.product_id
  AND p.deleted_at IS NULL;

-- =============================================================
-- STEP 3: Disable the old DB trigger
-- The JS service (productionService.js) will be the single path
-- for creating finished goods going forward.
-- =============================================================

DROP TRIGGER IF EXISTS trigger_auto_create_finished_goods ON production_batches;

-- Keep the functions around (they don't hurt), but the trigger
-- that called them is now disabled.

-- =============================================================
-- STEP 4: Verify — show what we ended up with
-- =============================================================

-- This is just for the SQL editor output, not functional
SELECT
  p.name,
  p.product_type,
  p.base_price,
  p.stock_quantity,
  p.cost_per_unit,
  p.active
FROM products p
WHERE p.deleted_at IS NULL
ORDER BY p.product_type DESC, p.name;

COMMIT;

-- =============================================================
-- EXPECTED RESULT:
-- - Products with completed batches → product_type = 'finished_good'
--   with stock_quantity = sum of all batch quantities
--   and base_price = original selling price (untouched)
--   and cost_per_unit = average production cost
--
-- - Products without completed batches → product_type = 'custom_design'
--   (unchanged, these are made-to-order designs)
--
-- - No duplicates, no "(Ready to Sell)" entries
-- - DB trigger disabled, JS service is the single path forward
-- =============================================================
