-- ============================================
-- SECURITY FIXES
-- ============================================
-- Resolves all issues flagged by Supabase Security Advisor:
--
-- [ERROR] SECURITY DEFINER views → recreate as SECURITY INVOKER
-- [ERROR] RLS references user_metadata → drop those policies
-- [WARN]  Function search_path mutable → pin to public
-- [WARN]  RLS policy always true → drop old permissive policies
-- [WARN]  Materialized view in API → revoke anon access
-- ============================================

-- ============================================
-- 1. DROP OLD PERMISSIVE / INSECURE RLS POLICIES
-- ============================================
-- These are leftover policies that use USING(true) or
-- reference user_metadata, undermining our role-based policies.

-- user_profiles: insecure policies referencing user_metadata
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON user_profiles;

-- expenses: overly permissive (USING true)
DROP POLICY IF EXISTS "Allow authenticated write access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated write expenses" ON expenses;

-- financial_settings: overly permissive
DROP POLICY IF EXISTS "Allow authenticated write financial_settings" ON financial_settings;

-- garment_types: overly permissive
DROP POLICY IF EXISTS "Allow authenticated write garment_types" ON garment_types;

-- overhead_costs: overly permissive
DROP POLICY IF EXISTS "Allow authenticated write access to overhead_costs" ON overhead_costs;
DROP POLICY IF EXISTS "Allow authenticated write overhead_costs" ON overhead_costs;

-- payments: overly permissive
DROP POLICY IF EXISTS "Allow authenticated write access to payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated write payments" ON payments;

-- customer_inquiries: overly permissive INSERT
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON customer_inquiries;

-- ============================================
-- 2. FIX SECURITY DEFINER VIEWS → SECURITY INVOKER
-- ============================================
-- SECURITY INVOKER means queries run with the caller's
-- permissions, so RLS is properly enforced.

-- raw_materials view
DROP VIEW IF EXISTS raw_materials;
CREATE VIEW raw_materials
WITH (security_invoker = true)
AS
SELECT * FROM materials
WHERE material_type = 'raw_material' AND deleted_at IS NULL;

-- finished_products view
DROP VIEW IF EXISTS finished_products;
CREATE VIEW finished_products
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

-- order_analytics view
-- Recreate with SECURITY INVOKER (adjust columns to match your existing view)
DROP VIEW IF EXISTS order_analytics;
CREATE VIEW order_analytics
WITH (security_invoker = true)
AS
SELECT
  o.id,
  o.order_number,
  o.status,
  o.order_date,
  o.due_date,
  o.total_cost,
  o.material_cost,
  o.labour_cost,
  o.overhead_cost,
  o.deposit,
  o.balance,
  o.order_type,
  o.created_at,
  o.updated_at,
  c.id AS customer_id,
  c.name AS customer_name,
  e.id AS tailor_id,
  e.name AS tailor_name,
  gt.name AS garment_type_name,
  gt.complexity,
  (o.total_cost - COALESCE(o.material_cost, 0) - COALESCE(o.labour_cost, 0) - COALESCE(o.overhead_cost, 0)) AS profit,
  CASE
    WHEN o.total_cost > 0
    THEN ((o.total_cost - COALESCE(o.material_cost, 0) - COALESCE(o.labour_cost, 0) - COALESCE(o.overhead_cost, 0)) / o.total_cost * 100)
    ELSE 0
  END AS profit_margin_pct
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN employees e ON o.assigned_tailor_id = e.id
LEFT JOIN garment_types gt ON o.garment_type_id = gt.id
WHERE o.deleted_at IS NULL;

-- recycle_bin view
DROP VIEW IF EXISTS recycle_bin;
CREATE VIEW recycle_bin
WITH (security_invoker = true)
AS
SELECT 'order' AS entity_type, id, order_number AS name, deleted_at
FROM orders WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'customer' AS entity_type, id, name, deleted_at
FROM customers WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'material' AS entity_type, id, name, deleted_at
FROM materials WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'product' AS entity_type, id, name, deleted_at
FROM products WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'batch' AS entity_type, id, batch_number AS name, deleted_at
FROM production_batches WHERE deleted_at IS NOT NULL;

-- ============================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================
-- Pin search_path to prevent search path injection attacks.

-- get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- generate_batch_number
CREATE OR REPLACE FUNCTION public.generate_batch_number()
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
  FROM public.production_batches
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());

  count_part := LPAD(next_number::TEXT, 3, '0');

  RETURN 'BATCH-' || year_part || month_part || '-' || count_part;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- set_batch_number
CREATE OR REPLACE FUNCTION public.set_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL THEN
    NEW.batch_number := public.generate_batch_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- update_batch_status
CREATE OR REPLACE FUNCTION public.update_batch_status()
RETURNS TRIGGER AS $$
DECLARE
  all_completed BOOLEAN;
  any_rework BOOLEAN;
BEGIN
  SELECT
    BOOL_AND(status = 'completed'),
    BOOL_OR(status = 'rework')
  INTO all_completed, any_rework
  FROM public.production_stages
  WHERE batch_id = NEW.batch_id;

  IF all_completed THEN
    UPDATE public.production_batches
    SET status = 'completed', completed_at = NOW()
    WHERE id = NEW.batch_id;
  ELSIF any_rework THEN
    UPDATE public.production_batches
    SET status = 'quality_check'
    WHERE id = NEW.batch_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- auto_create_finished_goods
CREATE OR REPLACE FUNCTION public.auto_create_finished_goods()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_cost NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT COALESCE(SUM(cost) / NEW.quantity, 0)
    INTO v_avg_cost
    FROM public.production_materials
    WHERE batch_id = NEW.id;

    PERFORM public.create_finished_product_from_batch(NEW.id, v_avg_cost);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- create_finished_product_from_batch
CREATE OR REPLACE FUNCTION public.create_finished_product_from_batch(
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
  FROM public.production_batches pb
  JOIN public.products p ON pb.product_id = p.id
  WHERE pb.id = p_batch_id;

  v_sku := 'FP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_product_id::TEXT, 1, 8);

  SELECT id INTO v_material_id
  FROM public.materials
  WHERE product_id = v_product_id
    AND material_type = 'finished_product'
  LIMIT 1;

  IF v_material_id IS NULL THEN
    INSERT INTO public.materials (
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
    UPDATE public.materials
    SET stock_quantity = stock_quantity + v_quantity,
        production_cost = p_unit_cost,
        cost_per_unit = p_unit_cost,
        updated_at = NOW()
    WHERE id = v_material_id;
  END IF;

  RETURN v_material_id;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- create_notification
CREATE OR REPLACE FUNCTION public.create_notification(
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
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- mark_all_notifications_read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- get_unread_notification_count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notifications
    WHERE (user_id = p_user_id OR user_id IS NULL)
      AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- generate_order_number (if exists in your DB)
CREATE OR REPLACE FUNCTION public.generate_order_number()
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
  FROM public.orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());

  count_part := LPAD(next_number::TEXT, 4, '0');

  RETURN 'GD-' || year_part || month_part || '-' || count_part;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- set_order_number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- calculate_order_profit (if exists in your DB)
CREATE OR REPLACE FUNCTION public.calculate_order_profit(p_order_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_profit NUMERIC;
BEGIN
  SELECT
    (total_cost - COALESCE(material_cost, 0) - COALESCE(labour_cost, 0) - COALESCE(overhead_cost, 0))
  INTO v_profit
  FROM public.orders
  WHERE id = p_order_id;

  RETURN COALESCE(v_profit, 0);
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM public.user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- refresh_analytics_views (if exists)
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.monthly_order_stats;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- 4. RESTRICT MATERIALIZED VIEW ACCESS
-- ============================================
-- Revoke direct anon access to monthly_order_stats.
-- Authenticated users can still query it through the app.

REVOKE SELECT ON public.monthly_order_stats FROM anon;

-- ============================================
-- 5. ALSO UPDATE 001_indexes_and_functions.sql VIEWS
-- ============================================
-- The views in that file have already been replaced above
-- with SECURITY INVOKER versions. No further action needed
-- if running migrations in order.
