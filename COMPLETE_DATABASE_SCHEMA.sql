-- ============================================
-- GLORIAZ DAUGHTER ERP - COMPLETE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Materials table
CREATE TABLE materials (
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
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

-- Employees table
CREATE TABLE employees (
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

-- Attendance table
CREATE TABLE attendance (
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

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'enquiry',
  order_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deposit DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  notes TEXT,
  assigned_tailor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  order_type VARCHAR(50) DEFAULT 'custom',
  product_id UUID, -- distinct from order_items, links to main product if standard
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  measurements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order materials (materials used in each order)
CREATE TABLE order_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity_used DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order timeline (status changes)
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Transactions table
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity_change DECIMAL(10, 2) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table (for predesigned garments)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  estimated_days INTEGER DEFAULT 7,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles table (links to auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'employee',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_order_materials_order ON order_materials(order_id);
CREATE INDEX idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX idx_inventory_transactions_material ON inventory_transactions(material_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_product ON orders(product_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate order number
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

-- Trigger function to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup
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

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for auto-generating order number
CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Triggers for updated_at
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to call the function on auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample materials
INSERT INTO materials (name, category, unit, stock_quantity, min_stock_level, cost_per_unit, supplier, description) VALUES
('Silk Fabric - Red', 'fabric', 'meters', 45.5, 10.0, 25.00, 'ABC Textiles', 'Premium quality silk fabric in deep red color'),
('Cotton Fabric - White', 'fabric', 'meters', 120.0, 20.0, 15.00, 'ABC Textiles', 'Pure cotton white fabric'),
('Polyester Thread - Black', 'thread', 'spools', 50, 15, 3.50, 'Thread Masters', 'Strong polyester thread'),
('Gold Buttons - Medium', 'buttons', 'pieces', 200, 50, 0.50, 'Button World', 'Decorative gold buttons'),
('Invisible Zipper - 12inch', 'zippers', 'pieces', 75, 25, 2.00, 'Zipper Co', '12 inch invisible zippers'),
('Lace Trim - White', 'lace', 'meters', 8.0, 15.0, 8.00, 'Lace Heaven', 'Delicate white lace trim'),
('Elastic Band - 1inch', 'elastic', 'meters', 30.0, 10.0, 1.50, 'Elastic World', 'Strong elastic band'),
('Interfacing - Light', 'interfacing', 'meters', 25.0, 10.0, 5.00, 'ABC Textiles', 'Light weight interfacing');

-- Insert sample employees
INSERT INTO employees (name, role, email, phone, hire_date, hourly_rate, active) VALUES
('Jane Phiri', 'tailor', 'jane.phiri@gd.com', '+260 977 123 456', '2023-01-15', 25.00, true),
('John Banda', 'cutter', 'john.banda@gd.com', '+260 966 789 012', '2023-03-20', 20.00, true),
('Mary Mwansa', 'designer', 'mary.mwansa@gd.com', '+260 955 345 678', '2022-11-10', 30.00, true),
('Peter Zulu', 'tailor', 'peter.zulu@gd.com', '+260 977 901 234', '2024-02-01', 22.00, true),
('Grace Ng''oma', 'assistant', 'grace.ngoma@gd.com', '+260 966 567 890', '2024-06-15', 15.00, true);

-- Insert sample customers
INSERT INTO customers (name, phone, email, measurements) VALUES
('Martha Mumba', '+260 977 111 222', 'martha@email.com', '{"bust": 36, "waist": 28, "hips": 38}'::jsonb),
('Sarah Banda', '+260 966 333 444', 'sarah@email.com', '{"bust": 34, "waist": 26, "hips": 36}'::jsonb),
('Grace Phiri', '+260 955 555 666', 'grace@email.com', '{"bust": 38, "waist": 30, "hips": 40}'::jsonb);

-- Insert sample products (predesigned garments)
INSERT INTO products (name, description, base_price, category, estimated_days) VALUES
('Summer Breeze Dress', 'Light cotton dress with floral pattern', 450.00, 'dress', 3),
('Executive Suit - Navy', 'Classic fit navy blue suit', 1200.00, 'suit', 5),
('Traditional Chitenge Wrapper', 'Custom print wrapper set', 300.00, 'traditional', 2);