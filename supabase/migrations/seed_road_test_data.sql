-- Road Test Data Seed
-- This file populates the database with realistic data for the 2-month client road test.
-- It includes Zambian context (currency, names) and a mix of historical and active data.

-- ==========================================
-- 1. CLEANUP (Optional - comment out if you want to keep existing data)
-- ==========================================
-- TRUNCATE orders, order_timeline, production_batches, production_stages, production_materials, materials, products, customers, garment_types CASCADE;

-- ==========================================
-- 2. GARMENT TYPES (Configuration)
-- ==========================================

-- Ensure columns exist for the road test (Self-healing schema)
ALTER TABLE garment_types ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;
ALTER TABLE garment_types ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE garment_types ADD COLUMN IF NOT EXISTS complexity TEXT DEFAULT 'medium';

INSERT INTO garment_types (name, base_labour_cost, estimated_hours, complexity, active, description)
VALUES 
  ('Custom Suit (2-Piece)', 450.00, 15, 'complex', true, 'Full bespoke suit including jacket and trousers'),
  ('Evening Gown', 350.00, 12, 'complex', true, 'Formal evening wear with intricate details'),
  ('Chitenge Dress', 150.00, 5, 'medium', true, 'Traditional print dress, various styles'),
  ('Chitenge Shirt', 100.00, 3, 'medium', true, 'Men or women traditional print shirt'),
  ('School Uniform (Set)', 80.00, 2, 'simple', true, 'Standard school uniform set'),
  ('Trousers / Skirt', 75.00, 2.5, 'simple', true, 'Basic bottom wear'),
  ('Wedding Dress (Bespoke)', 1500.00, 40, 'complex', true, 'Custom bridal gown with premium finishing')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. RAW MATERIALS (Inventory)
-- ==========================================
INSERT INTO materials (name, category, unit, cost_per_unit, stock_quantity, min_stock_level, reorder_level, supplier, material_type)
VALUES
  -- Fabrics
  ('Chitenge Print (Premium)', 'Fabric', 'meters', 45.00, 150, 20, 50, 'City Market Fabrics', 'raw_material'),
  ('Suiting Fabric (Navy)', 'Fabric', 'meters', 120.00, 60, 10, 20, 'Textile Hub', 'raw_material'),
  ('Costume Satin (White)', 'Fabric', 'meters', 35.00, 80, 15, 30, 'Textile Hub', 'raw_material'),
  ('Linen (Beige)', 'Fabric', 'meters', 85.00, 40, 10, 20, 'Imported', 'raw_material'),
  ('School Uniform Drill (Grey)', 'Fabric', 'meters', 55.00, 200, 30, 60, 'Local Factory', 'raw_material'),
  
  -- Trims & Accessories
  ('YKK Zippers (Invisible)', 'Trims', 'pieces', 5.00, 500, 50, 100, 'Trims R Us', 'raw_material'),
  ('Buttons (Shirt - White)', 'Trims', 'pack', 25.00, 50, 5, 10, 'Trims R Us', 'raw_material'),
  ('Buttons (Suit - Black)', 'Trims', 'pack', 45.00, 30, 5, 10, 'Trims R Us', 'raw_material'),
  ('Lining Fabric (Black)', 'Fabric', 'meters', 25.00, 100, 20, 40, 'Textile Hub', 'raw_material'),
  ('Interfacing (Fusible)', 'Trims', 'meters', 15.00, 100, 20, 40, 'Textile Hub', 'raw_material'),
  ('Thread (Assorted)', 'Consumables', 'spools', 12.00, 200, 20, 50, 'Market', 'raw_material')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. CUSTOMERS
-- ==========================================
INSERT INTO customers (name, phone, email, address, notes, measurements, created_at)
VALUES
  ('Mwape Zulu', '0977112233', 'mwape.zulu@example.com', '12 Independence Ave, Lusaka', 'Prefers loose fitting clothes', '{"bust": 36, "waist": 28, "hips": 40, "notes": "Athletic build"}', NOW() - INTERVAL '90 days'),
  ('Chanda Mulenga', '0966445566', 'chanda.m@example.com', 'Plot 45, Kabwata', 'Regular client for chitenge outfits', '{"bust": 38, "waist": 32, "hips": 42, "notes": "Likes high waist skirts"}', NOW() - INTERVAL '60 days'),
  ('John Banda', '0955778899', 'john.banda@example.com', 'Woodlands Ext, Lusaka', 'Needs suits for work', '{"chest": 42, "waist": 34, "inseam": 32, "notes": "Slim fit preference"}', NOW() - INTERVAL '45 days'),
  ('Mary Phiri', '0977998877', 'mary.p@example.com', 'Avondale, Lusaka', 'Wedding planner, brings bulk orders', '{"notes": "Bulk orders usually"}', NOW() - INTERVAL '30 days'),
  ('Grace Lungu', '0966112233', 'grace.l@example.com', 'Roma Park', 'VIP Client', '{"bust": 34, "waist": 26, "hips": 36, "notes": "Very particular about finishing"}', NOW() - INTERVAL '15 days'),
  ('Lazarous Tembo', '0955001122', 'laz.tembo@yahoo.com', 'Chilenje', 'School uniforms for kids', '{"notes": "Usually orders for 3 children"}', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. PRODUCTS (Pre-Designed Definitions)
-- ==========================================
INSERT INTO products (name, description, base_price, category, active, image_url)
VALUES
  ('Classic School Uniform', 'Standard grey uniform set (Shirt + Shorts/Skirt)', 350.00, 'Uniforms', true, 'https://images.unsplash.com/photo-1571454793758-a47738c82636?w=400&h=400&fit=crop'),
  ('Chitenge Laptop Bag', 'Padded laptop bag with chitenge print', 250.00, 'Accessories', true, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'),
  ('Summer Maxi Dress', 'Free-size flowy maxi dress', 450.00, 'Casual', true, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'),
  ('Gentleman Shirt (Ankara)', 'Fitted shirt with partial print', 350.00, 'Menswear', true, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 6. FINISHED GOODS STOCK (Inventory)
-- ==========================================
-- Link products to materials table for stock tracking
INSERT INTO materials (name, category, unit, stock_quantity, min_stock_level, cost_per_unit, material_type, finished_product_sku, selling_price, production_cost, product_id, reorder_level)
SELECT 
  p.name || ' (Ready Stock)',
  'finished_goods',
  'pieces',
  FLOOR(RANDOM() * 20 + 5), -- Random stock 5-25
  5,
  p.base_price * 0.7, -- Assume 70% of base price is production cost
  'finished_product',
  'FG-' || SUBSTRING(p.id::text, 1, 8),
  p.base_price,
  p.base_price * 0.7, -- Assume 70% of base price is production cost
  p.id,
  5
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM materials m WHERE m.product_id = p.id AND m.material_type = 'finished_product');

-- ==========================================
-- 7. ORDERS (Historical & Active)
-- ==========================================

-- A. Completed Orders (Past 3 Months)
DO $$
DECLARE 
  cust_record RECORD;
  garm_record RECORD;
  new_order_id UUID;
  order_date TIMESTAMP;
BEGIN
  -- Create 15 random historical orders
  FOR i IN 1..15 LOOP
    -- Select random customer and garment type
    SELECT * INTO cust_record FROM customers ORDER BY RANDOM() LIMIT 1;
    SELECT * INTO garm_record FROM garment_types ORDER BY RANDOM() LIMIT 1;
    order_date := NOW() - (floor(random() * 90) || ' days')::interval;

    -- Insert Order with Conflict Handling
    INSERT INTO orders (
      order_number, customer_id, garment_type_id, status, 
      total_cost, deposit, balance, 
      due_date, created_at, updated_at, 
      description, order_type
    ) VALUES (
        'RTD-' || to_char(order_date, 'YYYY') || '-' || lpad(i::text, 4, '0'), -- Using RTD (Road Test Data) prefix
        cust_record.id,
        garm_record.id,
        'delivered',
        garm_record.base_labour_cost * 1.5,
        garm_record.base_labour_cost * 1.5,
        0,
        order_date + INTERVAL '14 days',
        order_date,
        order_date + INTERVAL '14 days',
        garm_record.name || ' for ' || cust_record.name,
        'custom'
    ) ON CONFLICT (order_number) DO NOTHING
    RETURNING id INTO new_order_id;

    -- Only insert timeline if the order was actually created
    IF new_order_id IS NOT NULL THEN
      INSERT INTO order_timeline (order_id, status, notes, created_at) VALUES
        (new_order_id, 'enquiry', 'Customer enquired', order_date),
        (new_order_id, 'measurements', 'Measurements taken', order_date),
        (new_order_id, 'production', 'Started work', order_date + INTERVAL '2 days'),
        (new_order_id, 'completed', 'Work completed', order_date + INTERVAL '10 days'),
        (new_order_id, 'delivered', 'Collected by customer', order_date + INTERVAL '12 days');
    END IF;
      
  END LOOP;
END $$;

-- B. Active Orders (Current)
DO $$
DECLARE 
  cust_record RECORD;
  garm_record RECORD;
  new_order_id UUID;
BEGIN
  -- Create 5 active orders
  FOR i IN 16..20 LOOP
    SELECT * INTO cust_record FROM customers ORDER BY RANDOM() LIMIT 1;
    SELECT * INTO garm_record FROM garment_types ORDER BY RANDOM() LIMIT 1;

    INSERT INTO orders (
      order_number, customer_id, garment_type_id, status, 
      total_cost, deposit, balance, 
      due_date, created_at, updated_at, 
      description, order_type
    ) VALUES (
        'RTD-2025-' || lpad(i::text, 4, '0'),
        cust_record.id,
        garm_record.id,
        (ARRAY['measurements', 'production', 'fitting'])[floor(random() * 3 + 1)],
        garm_record.base_labour_cost * 1.5,
        (garm_record.base_labour_cost * 1.5) * 0.5,
        (garm_record.base_labour_cost * 1.5) * 0.5,
        NOW() + INTERVAL '7 days',
        NOW() - INTERVAL '2 days',
        NOW(),
        garm_record.name || ' (Urgent)',
        'custom'
    ) ON CONFLICT (order_number) DO NOTHING
    RETURNING id INTO new_order_id;
    
    IF new_order_id IS NOT NULL THEN
      INSERT INTO order_timeline (order_id, status, notes, created_at) VALUES
        (new_order_id, 'enquiry', 'Initial consultation', NOW() - INTERVAL '5 days'),
        (new_order_id, 'measurements', 'Measurements taken', NOW() - INTERVAL '4 days');
    END IF;
  END LOOP;
END $$;

-- ==========================================
-- 8. PRODUCTION BATCHES (For Pre-Designed)
-- ==========================================
INSERT INTO production_batches (batch_number, product_id, quantity, status, notes, created_at)
SELECT 
  'RTD-BATCH-' || LPAD(ROW_NUMBER() OVER()::text, 3, '0'), -- Changed to RTD prefix
  id,
  10,
  'stitching',
  'Restocking run',
  NOW()
FROM products
LIMIT 3
ON CONFLICT (batch_number) DO NOTHING;
