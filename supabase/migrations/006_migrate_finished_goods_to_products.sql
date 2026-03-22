-- Migration: Move finished goods from materials table to new products structure
-- This migration consolidates finished goods into the products table
-- as the single source of truth, while maintaining data integrity

BEGIN;

-- 1. Migrate existing finished products from materials table to products table
INSERT INTO products (
    name,
    category,
    description,
    base_price,
    product_type,
    stock_quantity,
    min_stock_level,
    cost_per_unit,
    active,
    created_at,
    updated_at
)
SELECT
    m.name,
    COALESCE(m.category, 'finished_goods'),
    'Migrated from inventory. SKU: ' || COALESCE(m.finished_product_sku, m.id::text),
    COALESCE(m.selling_price, m.cost_per_unit, 0),
    'finished_good',
    COALESCE(m.stock_quantity, 0),
    COALESCE(m.min_stock_level, m.reorder_level, 10),
    COALESCE(m.cost_per_unit, m.production_cost, 0),
    true,
    COALESCE(m.created_at, NOW()),
    COALESCE(m.updated_at, NOW())
FROM materials m
WHERE m.material_type = 'finished_product'
AND m.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- 2. Create a view that maintains backward compatibility with materials table
-- This allows existing queries to still work temporarily
CREATE OR REPLACE VIEW finished_goods_from_materials AS
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    p.base_price as selling_price,
    p.cost_per_unit as production_cost,
    p.stock_quantity,
    p.min_stock_level as reorder_level,
    p.product_type,
    p.active,
    p.created_at,
    p.updated_at,
    p.deleted_at
FROM products p
WHERE p.product_type = 'finished_good'
AND p.deleted_at IS NULL;

COMMENT ON VIEW finished_goods_from_materials IS 'Backward compatibility view for finished goods now stored in products table';

-- 3. Add a comment documenting the migration
COMMENT ON TABLE products IS 'Single source of truth for all products (custom designs and finished goods). Finished goods include stock tracking. Migrated finished_product rows from materials table to consolidate inventory management.';

-- 4. Log the migration completion
-- Insert a record into a migrations log (if you want to track this)
-- You can create a simple migrations_log table if needed:
-- INSERT INTO migrations_log (migration_name, status, executed_at) VALUES ('006_migrate_finished_goods', 'completed', NOW());

COMMIT;

-- Notes on migration:
-- 1. All finished products from materials table are now in products table with product_type='finished_good'
-- 2. The finished_goods_from_materials view provides temporary backward compatibility
-- 3. Existing catalog queries will continue to work via the new RLS policies
-- 4. The materials table is kept as-is for historical/raw material data
-- 5. Consider deprecating materials.material_type='finished_product' entries in a future migration
