-- Demo Data for Production Batches and Finished Goods
-- Run this after the main migrations

-- Insert demo production batches
INSERT INTO production_batches (batch_number, product_id, quantity, status, notes, created_at, updated_at)
SELECT 
  'BATCH-' || to_char(generate_series, 'FM0000'),
  (SELECT id FROM products ORDER BY RANDOM() LIMIT 1),
  (ARRAY[10, 15, 20, 25, 30])[floor(random() * 5 + 1)],
  (ARRAY['cutting', 'stitching', 'finishing', 'quality_check', 'completed'])[floor(random() * 5 + 1)],
  'Demo batch for testing production workflow',
  NOW() - (random() * interval '30 days'),
  NOW()
FROM generate_series(1, 5);

-- Insert production stages for each batch
INSERT INTO production_stages (batch_id, stage_name, status, started_at, completed_at, notes)
SELECT 
  pb.id,
  stage_name,
  CASE 
    WHEN stage_order <= CASE pb.status
      WHEN 'cutting' THEN 1
      WHEN 'stitching' THEN 2
      WHEN 'finishing' THEN 3
      WHEN 'quality_check' THEN 4
      WHEN 'completed' THEN 5
      ELSE 0
    END THEN 'completed'
    WHEN stage_order = CASE pb.status
      WHEN 'cutting' THEN 1
      WHEN 'stitching' THEN 2
      WHEN 'finishing' THEN 3
      WHEN 'quality_check' THEN 4
      WHEN 'completed' THEN 5
      ELSE 0
    END + 1 THEN 'in_progress'
    ELSE 'pending'
  END,
  CASE 
    WHEN stage_order <= CASE pb.status
      WHEN 'cutting' THEN 1
      WHEN 'stitching' THEN 2
      WHEN 'finishing' THEN 3
      WHEN 'quality_check' THEN 4
      WHEN 'completed' THEN 5
      ELSE 0
    END THEN pb.created_at + (stage_order || ' days')::interval
    ELSE NULL
  END,
  CASE 
    WHEN stage_order < CASE pb.status
      WHEN 'cutting' THEN 1
      WHEN 'stitching' THEN 2
      WHEN 'finishing' THEN 3
      WHEN 'quality_check' THEN 4
      WHEN 'completed' THEN 5
      ELSE 0
    END THEN pb.created_at + ((stage_order + 1) || ' days')::interval
    ELSE NULL
  END,
  'Demo stage tracking'
FROM production_batches pb
CROSS JOIN (
  VALUES 
    ('cutting', 1),
    ('stitching', 2),
    ('finishing', 3),
    ('quality_check', 4)
) AS stages(stage_name, stage_order);

-- Insert demo finished goods (stored in materials table)
INSERT INTO materials (
  name,
  category,
  unit,
  stock_quantity,
  min_stock_level,
  cost_per_unit,
  material_type,
  finished_product_sku,
  selling_price,
  production_cost,
  product_id,
  reorder_level,
  description,
  created_at,
  updated_at
)
SELECT 
  p.name || ' (Ready to Sell)',
  'finished_goods',
  'pieces',
  (ARRAY[5, 10, 15, 20, 25, 30])[floor(random() * 6 + 1)],
  5,
  p.base_price * 0.7,
  'finished_product',
  'FP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  p.base_price,
  p.base_price * 0.7,
  p.id,
  5,
  'Demo finished goods inventory',
  NOW() - (random() * interval '60 days'),
  NOW()
FROM products p
LIMIT 15;

-- Insert demo completed orders for P&L testing
INSERT INTO orders (
  order_number,
  customer_id,
  status,
  total_cost,
  deposit,
  balance,
  due_date,
  description,
  order_type,
  created_at,
  updated_at
)
SELECT 
  'DEMO-2025-' || LPAD(generate_series::text, 4, '0'),
  (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
  (ARRAY['completed', 'delivered'])[floor(random() * 2 + 1)],
  base_cost * (1 + profit_margin),
  base_cost * (1 + profit_margin) * 0.5, -- 50% deposit
  base_cost * (1 + profit_margin) * 0.5, -- 50% balance
  NOW() + (random() * interval '30 days'),
  'Demo order for P&L testing',
  'custom',
  completion_date,
  completion_date
FROM (
  SELECT 
    generate_series,
    (200 + random() * 800)::numeric(10,2) as base_cost,
    (ARRAY[0.15, 0.20, 0.25, 0.30, 0.35, 0.40, -0.05])[floor(random() * 7 + 1)] as profit_margin,
    NOW() - (random() * interval '90 days') as completion_date
  FROM generate_series(1, 30)
) AS order_data;

-- Update order timeline for completed orders
INSERT INTO order_timeline (order_id, status, notes, created_at)
SELECT 
  o.id,
  status_name,
  'Demo timeline entry',
  o.created_at + (status_order || ' days')::interval
FROM orders o
CROSS JOIN (
  VALUES 
    ('enquiry', 0),
    ('contacted', 1),
    ('measurements', 2),
    ('production', 3),
    ('fitting', 4),
    ('completed', 5),
    ('delivered', 6)
) AS statuses(status_name, status_order)
WHERE o.status IN ('completed', 'delivered')
  AND o.order_number LIKE 'DEMO-2025-%';
