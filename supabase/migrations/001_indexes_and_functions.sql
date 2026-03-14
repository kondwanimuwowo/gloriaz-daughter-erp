-- ============================================
-- INDEXES, FUNCTIONS & TRIGGERS
-- ============================================
-- Run after 000_base_schema.sql
-- ============================================

-- ============================================
-- INDEXES
-- ============================================

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NULL;

-- Employees
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active);

-- Materials
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_materials_product_id ON materials(product_id);
CREATE INDEX IF NOT EXISTS idx_materials_deleted_at ON materials(deleted_at) WHERE deleted_at IS NULL;

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_tailor ON orders(assigned_tailor_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_orders_garment_type ON orders(garment_type_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Order Materials
CREATE INDEX IF NOT EXISTS idx_order_materials_order_id ON order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_order_materials_material_id ON order_materials(material_id);

-- Order Timeline
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created_at ON order_timeline(created_at);

-- Inventory Transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_material_id ON inventory_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);

-- Financial
CREATE INDEX IF NOT EXISTS idx_overhead_costs_month ON overhead_costs(month);
CREATE INDEX IF NOT EXISTS idx_overhead_costs_category ON overhead_costs(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_order ON expenses(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);

-- Production
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_product ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_deleted_at ON production_batches(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_stages_batch ON production_stages(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_assigned ON production_stages(assigned_to);
CREATE INDEX IF NOT EXISTS idx_production_stages_status ON production_stages(status);
CREATE INDEX IF NOT EXISTS idx_production_materials_batch ON production_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_materials_material ON production_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_batch ON production_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_user ON production_logs(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Customer Inquiries
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_product ON customer_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status ON customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_created_at ON customer_inquiries(created_at);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Garment Types
CREATE INDEX IF NOT EXISTS idx_garment_types_active ON garment_types(active);

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(active);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate batch number (YYYY-MM-NNN format)
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

-- Auto-set batch number on insert
CREATE OR REPLACE FUNCTION set_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL THEN
    NEW.batch_number := generate_batch_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update batch status based on stage completions
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
    SET status = 'completed', completed_at = NOW()
    WHERE id = NEW.batch_id;
  ELSIF any_rework THEN
    UPDATE production_batches
    SET status = 'quality_check'
    WHERE id = NEW.batch_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create finished product from completed batch
CREATE OR REPLACE FUNCTION create_finished_product_from_batch(
  p_batch_id UUID,
  p_unit_cost NUMERIC
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
      name, category, unit, stock_quantity, min_stock_level,
      cost_per_unit, material_type, finished_product_sku,
      production_cost, product_id, reorder_level
    ) VALUES (
      v_product_name || ' (Finished)', 'finished_goods', 'pieces',
      v_quantity, 5, p_unit_cost, 'finished_product',
      v_sku, p_unit_cost, v_product_id, 5
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

-- Auto-create finished goods when batch completes
CREATE OR REPLACE FUNCTION auto_create_finished_goods()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_cost NUMERIC;
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

-- Notification helper functions
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

-- Production batch number auto-generation
CREATE TRIGGER trigger_set_batch_number
BEFORE INSERT ON production_batches
FOR EACH ROW
EXECUTE FUNCTION set_batch_number();

-- Batch status auto-update when stages change
CREATE TRIGGER trigger_update_batch_status
AFTER UPDATE ON production_stages
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_batch_status();

-- Auto-create finished goods on batch completion
CREATE TRIGGER trigger_auto_create_finished_goods
AFTER UPDATE ON production_batches
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION auto_create_finished_goods();

-- ============================================
-- VIEWS
-- ============================================

-- Raw materials view (SECURITY INVOKER = respects caller's RLS)
CREATE OR REPLACE VIEW raw_materials
WITH (security_invoker = true)
AS
SELECT * FROM materials
WHERE material_type = 'raw_material' AND deleted_at IS NULL;

-- Finished products view (SECURITY INVOKER = respects caller's RLS)
CREATE OR REPLACE VIEW finished_products
WITH (security_invoker = true)
AS
SELECT
  m.*,
  p.name AS product_name,
  p.description AS product_description,
  p.category AS product_category,
  p.image_url AS product_image,
  (m.selling_price - COALESCE(m.production_cost, 0)) AS profit_per_unit,
  CASE
    WHEN m.selling_price > 0 AND m.production_cost > 0
    THEN ((m.selling_price - m.production_cost) / m.selling_price * 100)
    ELSE 0
  END AS profit_margin_percent
FROM materials m
LEFT JOIN products p ON m.product_id = p.id
WHERE m.material_type = 'finished_product' AND m.deleted_at IS NULL;
