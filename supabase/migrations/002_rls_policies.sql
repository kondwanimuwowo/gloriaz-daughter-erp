-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- This migration enables RLS on all tables and defines
-- role-based access policies for admin, manager, and employee.
--
-- Safe to run on existing databases — all policies are
-- dropped before recreation (idempotent).
--
-- Role hierarchy:
--   admin   → full access to everything
--   manager → read/write on business data, read-only on user_profiles
--   employee → read-only on shared data, write own attendance
-- ============================================

-- ============================================
-- HELPER: Get current user's role
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- USER PROFILES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "Admin/manager can view all profiles" ON user_profiles;
CREATE POLICY "Admin/manager can view all profiles"
ON user_profiles FOR SELECT
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can create profiles" ON user_profiles;
CREATE POLICY "Admin can create profiles"
ON user_profiles FOR INSERT
WITH CHECK (get_user_role() = 'admin' OR id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid() OR get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can delete profiles" ON user_profiles;
CREATE POLICY "Admin can delete profiles"
ON user_profiles FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- CUSTOMERS
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
CREATE POLICY "Authenticated users can view customers"
ON customers FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert customers" ON customers;
CREATE POLICY "Admin/manager can insert customers"
ON customers FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update customers" ON customers;
CREATE POLICY "Admin/manager can update customers"
ON customers FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete customers" ON customers;
CREATE POLICY "Admin can delete customers"
ON customers FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- EMPLOYEES
-- ============================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
CREATE POLICY "Authenticated users can view employees"
ON employees FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert employees" ON employees;
CREATE POLICY "Admin/manager can insert employees"
ON employees FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update employees" ON employees;
CREATE POLICY "Admin/manager can update employees"
ON employees FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete employees" ON employees;
CREATE POLICY "Admin can delete employees"
ON employees FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- ORDERS
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
CREATE POLICY "Authenticated users can view orders"
ON orders FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update orders"
ON orders FOR UPDATE
USING (
  get_user_role() IN ('admin', 'manager')
  OR assigned_tailor_id = (SELECT id FROM employees WHERE email = (SELECT email FROM user_profiles WHERE id = auth.uid()) LIMIT 1)
);

DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders"
ON orders FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- ORDER ITEMS
-- ============================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;
CREATE POLICY "Authenticated users can view order items"
ON order_items FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create order items" ON order_items;
CREATE POLICY "Authenticated users can create order items"
ON order_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can update order items" ON order_items;
CREATE POLICY "Admin/manager can update order items"
ON order_items FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete order items" ON order_items;
CREATE POLICY "Admin can delete order items"
ON order_items FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- ORDER MATERIALS
-- ============================================

ALTER TABLE order_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view order materials" ON order_materials;
CREATE POLICY "Authenticated users can view order materials"
ON order_materials FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create order materials" ON order_materials;
CREATE POLICY "Authenticated users can create order materials"
ON order_materials FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can update order materials" ON order_materials;
CREATE POLICY "Admin/manager can update order materials"
ON order_materials FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete order materials" ON order_materials;
CREATE POLICY "Admin can delete order materials"
ON order_materials FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- ORDER TIMELINE
-- ============================================

ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view order timeline" ON order_timeline;
CREATE POLICY "Authenticated users can view order timeline"
ON order_timeline FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create timeline entries" ON order_timeline;
CREATE POLICY "Authenticated users can create timeline entries"
ON order_timeline FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Timeline entries are append-only (no update/delete)

-- ============================================
-- MATERIALS
-- ============================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view materials" ON materials;
CREATE POLICY "Authenticated users can view materials"
ON materials FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert materials" ON materials;
CREATE POLICY "Admin/manager can insert materials"
ON materials FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update materials" ON materials;
CREATE POLICY "Admin/manager can update materials"
ON materials FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete materials" ON materials;
CREATE POLICY "Admin can delete materials"
ON materials FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- INVENTORY TRANSACTIONS
-- ============================================

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view transactions" ON inventory_transactions;
CREATE POLICY "Authenticated users can view transactions"
ON inventory_transactions FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create transactions" ON inventory_transactions;
CREATE POLICY "Authenticated users can create transactions"
ON inventory_transactions FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Transactions are append-only (no update/delete for audit integrity)

-- ============================================
-- ATTENDANCE
-- ============================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view attendance" ON attendance;
CREATE POLICY "Authenticated users can view attendance"
ON attendance FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create attendance" ON attendance;
CREATE POLICY "Authenticated users can create attendance"
ON attendance FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can update attendance" ON attendance;
CREATE POLICY "Admin/manager can update attendance"
ON attendance FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete attendance" ON attendance;
CREATE POLICY "Admin can delete attendance"
ON attendance FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PRODUCTS
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
CREATE POLICY "Authenticated users can view products"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert products" ON products;
CREATE POLICY "Admin/manager can insert products"
ON products FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update products" ON products;
CREATE POLICY "Admin/manager can update products"
ON products FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete products" ON products;
CREATE POLICY "Admin can delete products"
ON products FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- GARMENT TYPES
-- ============================================

ALTER TABLE garment_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view garment types" ON garment_types;
CREATE POLICY "Authenticated users can view garment types"
ON garment_types FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert garment types" ON garment_types;
CREATE POLICY "Admin/manager can insert garment types"
ON garment_types FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update garment types" ON garment_types;
CREATE POLICY "Admin/manager can update garment types"
ON garment_types FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete garment types" ON garment_types;
CREATE POLICY "Admin can delete garment types"
ON garment_types FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- FINANCIAL SETTINGS
-- ============================================

ALTER TABLE financial_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/manager can view financial settings" ON financial_settings;
CREATE POLICY "Admin/manager can view financial settings"
ON financial_settings FOR SELECT
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can update financial settings" ON financial_settings;
CREATE POLICY "Admin can update financial settings"
ON financial_settings FOR UPDATE
USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can insert financial settings" ON financial_settings;
CREATE POLICY "Admin can insert financial settings"
ON financial_settings FOR INSERT
WITH CHECK (get_user_role() = 'admin');

-- ============================================
-- OVERHEAD COSTS
-- ============================================

ALTER TABLE overhead_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/manager can view overhead costs" ON overhead_costs;
CREATE POLICY "Admin/manager can view overhead costs"
ON overhead_costs FOR SELECT
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can insert overhead costs" ON overhead_costs;
CREATE POLICY "Admin/manager can insert overhead costs"
ON overhead_costs FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update overhead costs" ON overhead_costs;
CREATE POLICY "Admin/manager can update overhead costs"
ON overhead_costs FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete overhead costs" ON overhead_costs;
CREATE POLICY "Admin can delete overhead costs"
ON overhead_costs FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- EXPENSES
-- ============================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/manager can view expenses" ON expenses;
CREATE POLICY "Admin/manager can view expenses"
ON expenses FOR SELECT
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can insert expenses" ON expenses;
CREATE POLICY "Admin/manager can insert expenses"
ON expenses FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update expenses" ON expenses;
CREATE POLICY "Admin/manager can update expenses"
ON expenses FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete expenses" ON expenses;
CREATE POLICY "Admin can delete expenses"
ON expenses FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PAYMENTS
-- ============================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/manager can view payments" ON payments;
CREATE POLICY "Admin/manager can view payments"
ON payments FOR SELECT
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can insert payments" ON payments;
CREATE POLICY "Admin/manager can insert payments"
ON payments FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update payments" ON payments;
CREATE POLICY "Admin/manager can update payments"
ON payments FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete payments" ON payments;
CREATE POLICY "Admin can delete payments"
ON payments FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PRODUCTION BATCHES
-- ============================================

ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view batches" ON production_batches;
CREATE POLICY "Authenticated users can view batches"
ON production_batches FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert batches" ON production_batches;
CREATE POLICY "Admin/manager can insert batches"
ON production_batches FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update batches" ON production_batches;
CREATE POLICY "Admin/manager can update batches"
ON production_batches FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete batches" ON production_batches;
CREATE POLICY "Admin can delete batches"
ON production_batches FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PRODUCTION STAGES
-- ============================================

ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view stages" ON production_stages;
CREATE POLICY "Authenticated users can view stages"
ON production_stages FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert stages" ON production_stages;
CREATE POLICY "Admin/manager can insert stages"
ON production_stages FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Authorized users can update stages" ON production_stages;
CREATE POLICY "Authorized users can update stages"
ON production_stages FOR UPDATE
USING (
  get_user_role() IN ('admin', 'manager')
  OR assigned_to = (SELECT id FROM employees WHERE email = (SELECT email FROM user_profiles WHERE id = auth.uid()) LIMIT 1)
);

DROP POLICY IF EXISTS "Admin can delete stages" ON production_stages;
CREATE POLICY "Admin can delete stages"
ON production_stages FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PRODUCTION MATERIALS
-- ============================================

ALTER TABLE production_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view production materials" ON production_materials;
CREATE POLICY "Authenticated users can view production materials"
ON production_materials FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can insert production materials" ON production_materials;
CREATE POLICY "Admin/manager can insert production materials"
ON production_materials FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin/manager can update production materials" ON production_materials;
CREATE POLICY "Admin/manager can update production materials"
ON production_materials FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete production materials" ON production_materials;
CREATE POLICY "Admin can delete production materials"
ON production_materials FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- PRODUCTION LOGS
-- ============================================

ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view production logs" ON production_logs;
CREATE POLICY "Authenticated users can view production logs"
ON production_logs FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create production logs" ON production_logs;
CREATE POLICY "Authenticated users can create production logs"
ON production_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Production logs are append-only (no update/delete for audit integrity)

-- ============================================
-- NOTIFICATIONS
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
-- CUSTOMER INQUIRIES
-- ============================================

ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON customer_inquiries;
CREATE POLICY "Authenticated users can view inquiries"
ON customer_inquiries FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON customer_inquiries;
CREATE POLICY "Authenticated users can create inquiries"
ON customer_inquiries FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin/manager can update inquiries" ON customer_inquiries;
CREATE POLICY "Admin/manager can update inquiries"
ON customer_inquiries FOR UPDATE
USING (get_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Admin can delete inquiries" ON customer_inquiries;
CREATE POLICY "Admin can delete inquiries"
ON customer_inquiries FOR DELETE
USING (get_user_role() = 'admin');

-- ============================================
-- ENABLE REALTIME for key tables
-- ============================================
-- Note: Run these in Supabase dashboard if the ALTER PUBLICATION
-- syntax is not available in your migration runner.

-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE customers;
-- ALTER PUBLICATION supabase_realtime ADD TABLE materials;
-- ALTER PUBLICATION supabase_realtime ADD TABLE employees;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE production_batches;
-- ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
