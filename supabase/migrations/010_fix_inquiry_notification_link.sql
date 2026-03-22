-- Fix the inquiry notification trigger to link to /enquiries (matching the ERP route)
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
      'new_inquiry',
      'New Customer Enquiry',
      'New enquiry from ' || NEW.customer_name || ' for ' || COALESCE(product_name, 'a product'),
      '/enquiries',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
