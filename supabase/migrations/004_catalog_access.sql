-- ============================================
-- RLS Policies for Public Catalog Access
-- ============================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view finished products" ON materials;
DROP POLICY IF EXISTS "Public can submit inquiries" ON customer_inquiries;
DROP TRIGGER IF EXISTS on_new_inquiry ON customer_inquiries;

-- Allow anonymous/public READ on products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon
  USING (active = true AND deleted_at IS NULL);

-- Allow anonymous/public READ on materials (finished goods only)
CREATE POLICY "Public can view finished products"
  ON materials FOR SELECT
  TO anon
  USING (material_type = 'finished_product' AND deleted_at IS NULL);

-- Allow anonymous/public INSERT on customer_inquiries
CREATE POLICY "Public can submit inquiries"
  ON customer_inquiries FOR INSERT
  TO anon
  WITH CHECK (status = 'new');

-- ============================================
-- Trigger: Auto-create notifications on new inquiry
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
  product_name TEXT;
BEGIN
  -- Get product name
  SELECT name INTO product_name FROM products WHERE id = NEW.product_id;

  -- Create notification for all admin and manager users
  FOR admin_user IN
    SELECT id FROM user_profiles WHERE role IN ('admin', 'manager')
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, read)
    VALUES (
      admin_user.id,
      'order_update',
      'New Customer Inquiry',
      'New inquiry from ' || NEW.customer_name || ' for ' || COALESCE(product_name, 'a product'),
      '/inquiries',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_inquiry
  AFTER INSERT ON customer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_inquiry();
