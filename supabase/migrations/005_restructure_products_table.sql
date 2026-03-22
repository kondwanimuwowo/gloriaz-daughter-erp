-- Phase 1: Add new columns to products table
-- This migration restructures the products table to be the single source of truth
-- for both custom designs and finished goods

BEGIN;

-- 1. Create product_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('custom_design', 'finished_good');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'custom_design',
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier_id UUID,
ADD COLUMN IF NOT EXISTS barcode VARCHAR;

-- 3. Create index on product_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);

-- 4. Create index on stock for inventory management
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity)
WHERE product_type = 'finished_good' AND deleted_at IS NULL;

-- 5. Add comments to document the new columns
COMMENT ON COLUMN products.product_type IS 'Type of product: custom_design or finished_good';
COMMENT ON COLUMN products.stock_quantity IS 'Current inventory count (only for finished goods)';
COMMENT ON COLUMN products.min_stock_level IS 'Minimum stock level for low stock alerts';
COMMENT ON COLUMN products.cost_per_unit IS 'Actual cost per unit for finished goods';
COMMENT ON COLUMN products.supplier_id IS 'Reference to supplier (future use)';
COMMENT ON COLUMN products.barcode IS 'Product barcode for scanning (future use)';

-- 6. Update existing products to be custom_design by default
-- (They were design products in the ERP)
UPDATE products
SET product_type = 'custom_design'
WHERE product_type IS NULL AND deleted_at IS NULL;

-- 7. Create a view for finished goods (backward compatibility)
-- This replaces the need to query materials.finished_products
CREATE OR REPLACE VIEW finished_goods_catalog AS
SELECT
  id,
  name,
  description,
  base_price,
  category,
  image_url,
  gallery_images,
  stock_quantity,
  min_stock_level,
  cost_per_unit,
  active,
  featured,
  created_at,
  updated_at,
  deleted_at
FROM products
WHERE product_type = 'finished_good'
AND deleted_at IS NULL;

COMMENT ON VIEW finished_goods_catalog IS 'View of finished goods products for public catalog';

-- 8. Create trigger to automatically set min_stock_level if not provided for finished goods
CREATE OR REPLACE FUNCTION set_default_min_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_type = 'finished_good' AND NEW.min_stock_level IS NULL THEN
    NEW.min_stock_level := 10; -- Default minimum stock level
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_default_min_stock_trigger ON products;
CREATE TRIGGER set_default_min_stock_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_default_min_stock();

-- 9. Add RLS policy for finished goods inventory management
-- Managers can update stock levels
DROP POLICY IF EXISTS "Managers can update finished goods stock" ON products;
CREATE POLICY "Managers can update finished goods stock"
  ON products
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'authenticated'
    AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('manager', 'admin'))
    AND product_type = 'finished_good'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'authenticated'
    AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('manager', 'admin'))
    AND product_type = 'finished_good'
  );

-- 10. Add public catalog policy for finished goods
-- Anonymous users can see finished goods with stock > 0
DROP POLICY IF EXISTS "Public can view finished goods in stock" ON products;
CREATE POLICY "Public can view finished goods in stock"
  ON products
  FOR SELECT
  USING (
    product_type = 'finished_good'
    AND active = true
    AND deleted_at IS NULL
    AND COALESCE(stock_quantity, 0) > 0
  );

COMMIT;

-- Notes on migration:
-- 1. All existing products default to 'custom_design'
-- 2. Staff can mark products as 'finished_good' and populate stock fields
-- 3. View 'finished_goods_catalog' provides backward compatibility
-- 4. Stock tracking only applies to finished goods
-- 5. Public catalog shows both types: custom_design always, finished_good only if stock > 0
