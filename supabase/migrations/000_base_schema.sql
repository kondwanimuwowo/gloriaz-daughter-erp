-- ============================================
-- GLORIAZ DAUGHTER ERP - COMPLETE BASE SCHEMA
-- ============================================
-- This migration documents the full database schema.
-- Run ONLY on a fresh database. For existing databases,
-- use the incremental migrations instead.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CORE ENTITY TABLES
-- ============================================

-- User Profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'employee',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  address TEXT,
  measurements JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR NOT NULL,
  hire_date DATE NOT NULL,
  hourly_rate NUMERIC,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Products (garment catalog)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  category VARCHAR,
  image_url TEXT,
  estimated_days INTEGER DEFAULT 7,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE,
  stock_status VARCHAR DEFAULT 'in_stock',
  customizable BOOLEAN DEFAULT FALSE,
  gallery_images TEXT[],
  size_guide TEXT,
  fabric_details TEXT,
  care_instructions TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  labor_cost NUMERIC DEFAULT 0,
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Garment Types (labour cost configuration)
CREATE TABLE IF NOT EXISTS garment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  base_labour_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_hours NUMERIC DEFAULT 0,
  complexity VARCHAR DEFAULT 'standard',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_garment_types_updated_at
BEFORE UPDATE ON garment_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Materials (raw materials + finished goods)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  unit VARCHAR NOT NULL,
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  min_stock_level NUMERIC NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC NOT NULL,
  supplier VARCHAR,
  description TEXT,
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  material_type VARCHAR DEFAULT 'raw_material'
    CHECK (material_type IN ('raw_material', 'finished_product')),
  finished_product_sku VARCHAR,
  selling_price NUMERIC,
  production_cost NUMERIC,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reorder_level INTEGER DEFAULT 5,
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDER MANAGEMENT
-- ============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR NOT NULL DEFAULT 'enquiry',
  order_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  description TEXT,
  notes TEXT,
  assigned_tailor_id UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  labour_cost NUMERIC DEFAULT 0,
  overhead_cost NUMERIC DEFAULT 0,
  material_cost NUMERIC DEFAULT 0,
  profit_margin NUMERIC DEFAULT 0,
  garment_type_id UUID REFERENCES garment_types(id),
  order_type VARCHAR DEFAULT 'custom',
  product_id UUID REFERENCES products(id),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  price NUMERIC NOT NULL,
  measurements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Materials (material consumption per order)
CREATE TABLE IF NOT EXISTS order_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  quantity_used NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Timeline (status audit trail)
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INVENTORY & TRANSACTIONS
-- ============================================

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id),
  quantity_change NUMERIC NOT NULL,
  operation_type VARCHAR NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  order_id UUID REFERENCES orders(id),
  unit_cost NUMERIC
);

-- ============================================
-- EMPLOYEE MANAGEMENT
-- ============================================

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  clock_in TIMESTAMP,
  clock_out TIMESTAMP,
  hours_worked NUMERIC,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FINANCIAL TABLES
-- ============================================

-- Financial Settings
CREATE TABLE IF NOT EXISTS financial_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_hourly_rate NUMERIC DEFAULT 25.00,
  default_profit_margin NUMERIC DEFAULT 40.00,
  expected_monthly_orders INTEGER DEFAULT 40,
  tax_rate NUMERIC DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if empty
INSERT INTO financial_settings (custom_hourly_rate, default_profit_margin, expected_monthly_orders, tax_rate)
SELECT 25.00, 40.00, 40, 0.00
WHERE NOT EXISTS (SELECT 1 FROM financial_settings);

-- Overhead Costs
CREATE TABLE IF NOT EXISTS overhead_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  is_recurring BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_overhead_costs_updated_at
BEFORE UPDATE ON overhead_costs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_method TEXT,
  reference_number TEXT,
  employee_id UUID REFERENCES employees(id),
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRODUCTION SYSTEM
-- ============================================

-- Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(50) DEFAULT 'cutting'
    CHECK (status IN ('cutting', 'stitching', 'finishing', 'quality_check', 'completed', 'cancelled')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  material_cost NUMERIC DEFAULT 0,
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_production_batches_updated_at
BEFORE UPDATE ON production_batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Production Stages
CREATE TABLE IF NOT EXISTS production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL
    CHECK (stage_name IN ('cutting', 'stitching', 'finishing', 'quality_check')),
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rework')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  quality_issues TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  input_data JSONB DEFAULT '{}'
);

CREATE TRIGGER update_production_stages_updated_at
BEFORE UPDATE ON production_stages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Production Materials
CREATE TABLE IF NOT EXISTS production_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity_used NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Production Logs (audit trail)
CREATE TABLE IF NOT EXISTS production_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'order_update', 'production_complete', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CUSTOMER INQUIRIES (Product inquiry tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS customer_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_email VARCHAR,
  preferred_size VARCHAR,
  custom_measurements_needed BOOLEAN DEFAULT FALSE,
  special_requests TEXT,
  contact_method VARCHAR DEFAULT 'whatsapp',
  status VARCHAR DEFAULT 'new',
  staff_notes TEXT,
  converted_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  contacted_at TIMESTAMP
);

CREATE TRIGGER update_customer_inquiries_updated_at
BEFORE UPDATE ON customer_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
