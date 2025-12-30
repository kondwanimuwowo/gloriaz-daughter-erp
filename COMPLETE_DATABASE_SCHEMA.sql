-- ============================================
-- GLORIAZ DAUGHTER ERP - COMPLETE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 1. Garment Types (Reference Data)
CREATE TABLE IF NOT EXISTS garment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  base_labour_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  complexity VARCHAR(50) DEFAULT 'basic',
  estimated_hours INTEGER DEFAULT 4,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Products (Pre-designed Garments)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  estimated_days INTEGER DEFAULT 7,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Materials (Raw Materials & Finished Goods)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  supplier VARCHAR(255),
  description TEXT,
  last_restocked TIMESTAMP,
  
  -- Finished Goods specific columns
  material_type VARCHAR(50) DEFAULT 'raw_material' CHECK (material_type IN ('raw_material', 'finished_product')),
  finished_product_sku VARCHAR(100),
  selling_price DECIMAL(10, 2),
  production_cost DECIMAL(10, 2),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reorder_level INTEGER DEFAULT 5,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  measurements JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) NOT NULL,
  hire_date DATE NOT NULL,
  hourly_rate DECIMAL(10, 2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. User Profiles (Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'employee',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'enquiry',
  order_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  material_cost DECIMAL(10, 2) DEFAULT 0,
  labour_cost DECIMAL(10, 2) DEFAULT 0,
  overhead_cost DECIMAL(10, 2) DEFAULT 0,
  profit_margin DECIMAL(10, 2) DEFAULT 0,
  deposit DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  notes TEXT,
  assigned_tailor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  order_type VARCHAR(50) DEFAULT 'custom',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  measurements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Order Materials
CREATE TABLE IF NOT EXISTS order_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity_used DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Order Timeline
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMP,
  clock_out TIMESTAMP,
  hours_worked DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 12. Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity_change DECIMAL(10, 2) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  notes TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  unit_cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
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

-- 14. Production Stages
CREATE TABLE IF NOT EXISTS production_stages (
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

-- 15. Production Materials (Bulk)
CREATE TABLE IF NOT EXISTS production_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity_used DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 16. Notifications (NEW)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'order_update', 'production_complete', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Core Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_order_materials_order ON order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_material ON inventory_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);

-- Finished Goods Indexes
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);

-- Production Indexes
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_product ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_batch ON production_stages(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_assigned ON production_stages(assigned_to);
CREATE INDEX IF NOT EXISTS idx_production_stages_status ON production_stages(status);
CREATE INDEX IF NOT EXISTS idx_production_materials_batch ON production_materials(batch_id);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- ============================================
-- VIEWS
-- ============================================

-- View for raw materials
CREATE OR REPLACE VIEW raw_materials AS
SELECT * FROM materials
WHERE material_type = 'raw_material';

-- View for finished products
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

-- ============================================
-- FUNCTIONS
-- ============================================

-- Order Number Generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  count_part TEXT;
  next_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO next_number
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  count_part := LPAD(next_number::TEXT, 4, '0');
  RETURN 'GD-' || year_part || '-' || count_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function: Set Order Number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timestamp Updater
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- User Profile Handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Production Batch Number Generator
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

-- Trigger Function: Set Batch Number
CREATE OR REPLACE FUNCTION set_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL THEN
    NEW.batch_number := generate_batch_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update Batch Status
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
DECLARE
  all_completed BOOLEAN;
  any_rework BOOLEAN;
BEGIN
  SELECT 
    BOOL_AND(status = 'completed'),
    BOOL_OR(status = 'rework')
  INTO all_completed, any_rework
  FROM production_stages
  WHERE batch_id = NEW.batch_id;
  
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

-- Function: Create Finished Product from Batch
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
  SELECT pb.product_id, pb.quantity, p.name
  INTO v_product_id, v_quantity, v_product_name
  FROM production_batches pb
  JOIN products p ON pb.product_id = p.id
  WHERE pb.id = p_batch_id;
  
  v_sku := 'FP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_product_id::TEXT, 1, 8);
  
  SELECT id INTO v_material_id
  FROM materials
  WHERE product_id = v_product_id 
    AND material_type = 'finished_product'
  LIMIT 1;
  
  IF v_material_id IS NULL THEN
    INSERT INTO materials (
      name, category, unit, stock_quantity, min_stock_level, cost_per_unit,
      material_type, finished_product_sku, production_cost, product_id, reorder_level
    ) VALUES (
      v_product_name || ' (Finished)', 'finished_goods', 'pieces', v_quantity, 5, p_unit_cost,
      'finished_product', v_sku, p_unit_cost, v_product_id, 5
    )
    RETURNING id INTO v_material_id;
  ELSE
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

-- Function: Auto Create Finished Goods Trigger Logic
CREATE OR REPLACE FUNCTION auto_create_finished_goods()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_cost DECIMAL(10, 2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT COALESCE(SUM(cost) / NEW.quantity, 0)
    INTO v_avg_cost
    FROM production_materials
    WHERE batch_id = NEW.id;
    
    PERFORM create_finished_product_from_batch(NEW.id, v_avg_cost);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification Helper Functions
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE (user_id = p_user_id OR user_id IS NULL)
      AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Order Number
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Batch Number
DROP TRIGGER IF EXISTS trigger_set_batch_number ON production_batches;
CREATE TRIGGER trigger_set_batch_number
BEFORE INSERT ON production_batches
FOR EACH ROW
EXECUTE FUNCTION set_batch_number();

-- Update Batch Status
DROP TRIGGER IF EXISTS trigger_update_batch_status ON production_stages;
CREATE TRIGGER trigger_update_batch_status
AFTER UPDATE ON production_stages
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_batch_status();

-- Auto Create Finished Goods
DROP TRIGGER IF EXISTS trigger_auto_create_finished_goods ON production_batches;
CREATE TRIGGER trigger_auto_create_finished_goods
AFTER UPDATE ON production_batches
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION auto_create_finished_goods();

-- Updated At Triggers
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_garment_types_updated_at ON garment_types;
CREATE TRIGGER update_garment_types_updated_at BEFORE UPDATE ON garment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_production_batches_updated_at ON production_batches;
CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_production_stages_updated_at ON production_stages;
CREATE TRIGGER update_production_stages_updated_at BEFORE UPDATE ON production_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth User Creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES (Notifications Only specified explicitly, assuming standard perms for others)
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
CREATE POLICY "Authenticated users can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- END OF SCHEMA
-- ============================================