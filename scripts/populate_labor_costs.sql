-- 0. Ensure columns exist (Run this if you haven't already)
ALTER TABLE products ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS material_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10, 2) DEFAULT 0;

-- 1. Populate sample labor costs for Products based on category
-- Standard garments: K50
UPDATE products 
SET labor_cost = 50.00 
WHERE category = 'standard' OR category IS NULL;

-- Premium garments: K120
UPDATE products 
SET labor_cost = 120.00 
WHERE category = 'premium';

-- Uniforms: K40 (assuming bulk/simpler)
UPDATE products 
SET labor_cost = 40.00 
WHERE category = 'uniform';

-- Custom orders: K150 (more complex)
UPDATE products 
SET labor_cost = 150.00 
WHERE category = 'custom';


-- 2. Backfill existing Production Batches with calculated labor costs
-- This calculates: Batch Quantity * Product's New Labor Cost
UPDATE production_batches pb
SET labor_cost = (
    SELECT p.labor_cost * pb.quantity 
    FROM products p 
    WHERE p.id = pb.product_id
)
WHERE pb.labor_cost IS NULL OR pb.labor_cost = 0;


-- 3. Verify the updates
SELECT name, category, labor_cost FROM products ORDER BY labor_cost DESC;
SELECT b.batch_number, b.quantity, p.labor_cost as unit_labor, b.labor_cost as total_labor_cost 
FROM production_batches b
JOIN products p ON b.product_id = p.id
LIMIT 10;
