-- ============================================
-- PRODUCTION TRACKING SYSTEM - DATABASE MIGRATION
-- ============================================

-- Production Batches Table
-- Tracks batches of garments being produced
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(50) DEFAULT 'cutting' CHECK (status IN ('cutting', 'stitching', 'finishing', 'quality_check', 'completed', 'cancelled')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Production Stages Table
-- Tracks individual stages within each batch
CREATE TABLE production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL CHECK (stage_name IN ('cutting', 'stitching', 'finishing', 'quality_check')),
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rework')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  quality_issues TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Production Materials Usage Table
-- Tracks materials used in production batches
CREATE TABLE production_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity_used DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_production_batches_status ON production_batches(status);
CREATE INDEX idx_production_batches_product ON production_batches(product_id);
CREATE INDEX idx_production_stages_batch ON production_stages(batch_id);
CREATE INDEX idx_production_stages_assigned ON production_stages(assigned_to);
CREATE INDEX idx_production_stages_status ON production_stages(status);
CREATE INDEX idx_production_materials_batch ON production_materials(batch_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate batch number
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  count_part TEXT;
  next_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  month_part := TO_CHAR(NOW(), 'MM');
  
  SELECT COUNT(*) + 1 INTO next_number
  FROM production_batches
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
  
  count_part := LPAD(next_number::TEXT, 3, '0');
  
  RETURN 'BATCH-' || year_part || month_part || '-' || count_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate batch number
CREATE OR REPLACE FUNCTION set_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL THEN
    NEW.batch_number := generate_batch_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update batch status based on stages
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
DECLARE
  all_completed BOOLEAN;
  any_rework BOOLEAN;
BEGIN
  -- Check if all stages are completed
  SELECT 
    BOOL_AND(status = 'completed'),
    BOOL_OR(status = 'rework')
  INTO all_completed, any_rework
  FROM production_stages
  WHERE batch_id = NEW.batch_id;
  
  -- Update batch status
  IF all_completed THEN
    UPDATE production_batches
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = NEW.batch_id;
  ELSIF any_rework THEN
    UPDATE production_batches
    SET status = 'quality_check'
    WHERE id = NEW.batch_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for auto-generating batch number
CREATE TRIGGER trigger_set_batch_number
BEFORE INSERT ON production_batches
FOR EACH ROW
EXECUTE FUNCTION set_batch_number();

-- Trigger for updated_at
CREATE TRIGGER update_production_batches_updated_at 
BEFORE UPDATE ON production_batches
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_stages_updated_at 
BEFORE UPDATE ON production_stages
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update batch status when stage changes
CREATE TRIGGER trigger_update_batch_status
AFTER UPDATE ON production_stages
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_batch_status();

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample production batch
INSERT INTO production_batches (product_id, quantity, status, started_at) 
SELECT id, 5, 'cutting', NOW()
FROM products 
LIMIT 1;

-- Insert production stages for the batch
INSERT INTO production_stages (batch_id, stage_name, status)
SELECT id, 'cutting', 'in_progress'
FROM production_batches
LIMIT 1;

INSERT INTO production_stages (batch_id, stage_name, status)
SELECT id, 'stitching', 'pending'
FROM production_batches
LIMIT 1;

INSERT INTO production_stages (batch_id, stage_name, status)
SELECT id, 'finishing', 'pending'
FROM production_batches
LIMIT 1;

INSERT INTO production_stages (batch_id, stage_name, status)
SELECT id, 'quality_check', 'pending'
FROM production_batches
LIMIT 1;
