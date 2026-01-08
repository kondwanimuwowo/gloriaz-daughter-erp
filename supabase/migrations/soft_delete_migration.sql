-- Soft Delete Migration
-- Adds deleted_at column to core entities and updates RLS/Constraints

-- 1. Add deleted_at column to core tables
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_production_batches_deleted_at ON production_batches(deleted_at);
CREATE INDEX IF NOT EXISTS idx_materials_deleted_at ON materials(deleted_at);

-- 3. Utility View for Recycle Bin
-- This allows easy querying of all deleted items in one place (union) or we can query tables individually.
-- A centralized view is nice for the minimal UI.

CREATE OR REPLACE VIEW recycle_bin AS
SELECT 
  'order' as type,
  id,
  order_number as name, -- Polymorphic name
  deleted_at,
  'orders' as table_name
FROM orders WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'customer' as type,
  id,
  name,
  deleted_at,
  'customers' as table_name
FROM customers WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'product' as type,
  id,
  name,
  deleted_at,
  'products' as table_name
FROM products WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'batch' as type,
  id,
  batch_number as name,
  deleted_at,
  'production_batches' as table_name
FROM production_batches WHERE deleted_at IS NOT NULL;

-- 4. RLS Policies
-- We need to ensure standard queries filtered out deleted items.
-- Since this is an existing app, modifying every single SELECT query in the codebase is risky/tedious.
-- Better approach: Use RLS to filter them out by default for 'authenticated' role, 
-- BUT provide a way to bypass it for the Recycle Bin (maybe via a special function or a 'recycle_bin' role??)
-- OR just update the service layer to always append `.is('deleted_at', null)`.
-- Updating the service layer is SAFER than RLS because RLS hiding it makes it invisible to "Restore" actions too unless we are careful.

-- Decision: We will NOT strictly hide them via RLS for now (to avoid breaking admin/restore flows), 
-- but we will update the Service Layer to filter them.
-- HOWEVER, we can stick the columns in.

-- Wait, if we rely on Service Layer, raw queries might still show them. 
-- Let's stick to Service Layer updates for specific "fetch" calls.

-- ...
