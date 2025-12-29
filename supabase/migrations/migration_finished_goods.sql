-- ============================================
-- INVENTORY FINISHED GOODS - DATABASE MIGRATION
-- ============================================

-- Alter materials table to support finished products
ALTER TABLE materials 
ADD COLUMN material_type VARCHAR(50) DEFAULT 'raw_material' CHECK (material_type IN ('raw_material', 'finished_product')),
ADD COLUMN finished_product_sku VARCHAR(100),
ADD COLUMN selling_price DECIMAL(10, 2),
ADD COLUMN production_cost DECIMAL(10, 2),
ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL,
ADD COLUMN reorder_level INTEGER DEFAULT 5;

-- Add index for material_type for faster filtering
CREATE INDEX idx_materials_type ON materials(material_type);

-- Create a view for easy querying of raw materials
CREATE OR REPLACE VIEW raw_materials AS
SELECT * FROM materials
WHERE material_type = 'raw_material';

-- Create a view for easy querying of finished products
CREATE OR REPLACE VIEW finished_products AS
SELECT 
  m.*,
  p.name as product_name,
  p.description as product_description,
  p.category as product_category,
  p.image_url as product_image,
  (m.selling_price - COALESCE(m.production_cost, 0)) as profit_per_unit,
  CASE 
    WHEN m.selling_price > 0 AND m.production_cost > 0 
    THEN ((m.selling_price - m.production_cost) / m.selling_price * 100)
    ELSE 0
  END as profit_margin_percent
FROM materials m
LEFT JOIN products p ON m.product_id = p.id
WHERE m.material_type = 'finished_product';

-- Function to create finished product from production batch
CREATE OR REPLACE FUNCTION create_finished_product_from_batch(
  p_batch_id UUID,
  p_unit_cost DECIMAL(10, 2)
)
RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
  v_product_name VARCHAR(255);
  v_quantity INTEGER;
  v_sku VARCHAR(100);
  v_material_id UUID;
BEGIN
  -- Get batch details
  SELECT pb.product_id, pb.quantity, p.name
  INTO v_product_id, v_quantity, v_product_name
  FROM production_batches pb
  JOIN products p ON pb.product_id = p.id
  WHERE pb.id = p_batch_id;
  
  -- Generate SKU
  v_sku := 'FP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_product_id::TEXT, 1, 8);
  
  -- Check if finished product already exists for this product
  SELECT id INTO v_material_id
  FROM materials
  WHERE product_id = v_product_id 
    AND material_type = 'finished_product'
  LIMIT 1;
  
  IF v_material_id IS NULL THEN
    -- Create new finished product entry
    INSERT INTO materials (
      name,
      category,
      unit,
      stock_quantity,
      min_stock_level,
      cost_per_unit,
      material_type,
      finished_product_sku,
      production_cost,
      product_id,
      reorder_level
    ) VALUES (
      v_product_name || ' (Finished)',
      'finished_goods',
      'pieces',
      v_quantity,
      5,
      p_unit_cost,
      'finished_product',
      v_sku,
      p_unit_cost,
      v_product_id,
      5
    )
    RETURNING id INTO v_material_id;
  ELSE
    -- Update existing finished product stock
    UPDATE materials
    SET stock_quantity = stock_quantity + v_quantity,
        production_cost = p_unit_cost,
        cost_per_unit = p_unit_cost,
        updated_at = NOW()
    WHERE id = v_material_id;
  END IF;
  
  RETURN v_material_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create finished goods when batch completes
CREATE OR REPLACE FUNCTION auto_create_finished_goods()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_cost DECIMAL(10, 2);
BEGIN
  -- Only proceed if status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate average production cost from materials used
    SELECT COALESCE(SUM(cost) / NEW.quantity, 0)
    INTO v_avg_cost
    FROM production_materials
    WHERE batch_id = NEW.id;
    
    -- Create or update finished product
    PERFORM create_finished_product_from_batch(NEW.id, v_avg_cost);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to auto-create finished goods when batch completes
CREATE TRIGGER trigger_auto_create_finished_goods
AFTER UPDATE ON production_batches
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION auto_create_finished_goods();

-- ============================================
-- UPDATE EXISTING DATA
-- ============================================

-- Mark all existing materials as raw materials
UPDATE materials
SET material_type = 'raw_material'
WHERE material_type IS NULL;

-- ============================================
-- SAMPLE FINISHED PRODUCTS (Optional)
-- ============================================

-- Create sample finished products linked to existing products
INSERT INTO materials (
  name,
  category,
  unit,
  stock_quantity,
  min_stock_level,
  cost_per_unit,
  material_type,
  finished_product_sku,
  selling_price,
  production_cost,
  product_id,
  reorder_level
)
SELECT 
  p.name || ' (Ready to Sell)',
  'finished_goods',
  'pieces',
  10,
  5,
  p.base_price * 0.7, -- Assume 70% of base price is production cost
  'finished_product',
  'FP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  p.base_price,
  p.base_price * 0.7,
  p.id,
  5
FROM products p
WHERE p.active = true
LIMIT 3;
