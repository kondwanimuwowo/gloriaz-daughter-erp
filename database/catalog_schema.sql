-- ============================================
-- PUBLIC CATALOG - DATABASE SCHEMA
-- ============================================

-- 1. Create customer_inquiries table
CREATE TABLE IF NOT EXISTS customer_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Inquiry Details
  preferred_size VARCHAR(50), -- S, M, L, XL, Custom
  custom_measurements_needed BOOLEAN DEFAULT false,
  special_requests TEXT,
  
  -- Contact Preferences
  contact_method VARCHAR(50) DEFAULT 'whatsapp', -- whatsapp, phone, email
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, converted, declined
  staff_notes TEXT,
  converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  contacted_at TIMESTAMP
);

-- 2. Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS customizable BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON customer_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON customer_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;

-- 4. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (active = true);

DROP POLICY IF EXISTS "Staff can manage products" ON products;
CREATE POLICY "Staff can manage products"
ON products FOR ALL
USING (auth.role() = 'authenticated');

-- 6. RLS Policies for customer_inquiries
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON customer_inquiries;
CREATE POLICY "Anyone can submit inquiries"
ON customer_inquiries FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage inquiries" ON customer_inquiries;
CREATE POLICY "Staff can manage inquiries"
ON customer_inquiries FOR ALL
USING (auth.role() = 'authenticated');

-- 7. Insert sample products
INSERT INTO products (name, description, base_price, category, image_url, estimated_days, active, featured, customizable, stock_status, fabric_details, care_instructions) VALUES
(
  'Zambian Sunset Chitenge Dress',
  'Elegant A-line dress featuring vibrant Zambian Chitenge fabric with sunset-inspired patterns. Perfect for cultural events, weddings, and special occasions. This dress celebrates Zambian heritage with a modern silhouette.',
  450.00,
  'Traditional Wear',
  '/images/products/product-1-main.jpg',
  7,
  true,
  true,
  true,
  'made_to_order',
  'Premium Chitenge fabric (100% cotton), Breathable and comfortable, Vibrant colorfast dyes',
  'Hand wash or gentle machine wash, Iron on medium heat, Avoid bleach'
),
(
  'Executive Kaunda Suit',
  'Classic Kaunda suit in premium fabric, perfect for formal occasions and professional settings. Named after Zambia''s founding father, this suit represents dignity and style. Tailored to perfection with attention to detail.',
  850.00,
  'Traditional Wear',
  '/images/products/product-2-main.jpg',
  10,
  true,
  true,
  true,
  'made_to_order',
  'Premium wool blend, Lined interior, Reinforced stitching',
  'Dry clean only, Store on hanger, Steam to remove wrinkles'
),
(
  'Lusaka Business Blazer',
  'Tailored blazer with modern cut, ideal for professional settings. This versatile piece transitions seamlessly from office to evening events. Features a contemporary fit with classic styling.',
  650.00,
  'Formal Wear',
  '/images/products/product-3-main.jpg',
  7,
  true,
  false,
  false,
  'in_stock',
  'Polyester-wool blend, Structured shoulders, Two-button closure',
  'Dry clean recommended, Can be lightly steamed, Avoid direct sunlight storage'
),
(
  'Victoria Falls Evening Gown',
  'Floor-length gown with flowing silhouette, inspired by the majesty of Victoria Falls. This stunning piece features elegant draping and a timeless design perfect for galas, weddings, and formal events.',
  1200.00,
  'Formal Wear',
  '/images/products/product-4-main.jpg',
  14,
  true,
  true,
  true,
  'made_to_order',
  'Silk chiffon overlay, Satin lining, Delicate beadwork accents',
  'Dry clean only, Handle beadwork with care, Store in garment bag'
),
(
  'Kafue Casual Dress',
  'Comfortable midi dress perfect for everyday wear. Named after the beautiful Kafue River, this dress combines comfort with style. Features a relaxed fit and practical pockets.',
  350.00,
  'Casual Wear',
  '/images/products/product-5-main.jpg',
  5,
  true,
  false,
  false,
  'in_stock',
  '100% cotton, Breathable fabric, Side pockets',
  'Machine wash cold, Tumble dry low, Iron if needed'
),
(
  'Copper Belt Shirt',
  'Relaxed-fit shirt with subtle African-inspired details. Perfect for casual outings and weekend wear. The Copper Belt design pays homage to Zambia''s mining heritage with copper-toned accents.',
  280.00,
  'Casual Wear',
  '/images/products/product-6-main.jpg',
  5,
  true,
  false,
  false,
  'in_stock',
  'Cotton-linen blend, Button-down collar, Chest pocket',
  'Machine wash warm, Hang dry recommended, Iron on cotton setting'
),
(
  'Bridal Elegance Gown',
  'Stunning white wedding gown with intricate beadwork and lace details. This masterpiece is designed to make your special day unforgettable. Features a fitted bodice and flowing train.',
  2500.00,
  'Bridal & Events',
  '/images/products/product-7-main.jpg',
  21,
  true,
  true,
  true,
  'made_to_order',
  'Premium satin, French lace overlay, Hand-sewn beadwork, Cathedral train',
  'Professional dry clean only, Preserve after wedding, Handle train with care'
),
(
  'Matebeto Ceremony Dress',
  'Traditional ceremony dress with modern touches. Perfect for Matebeto (traditional wedding ceremony) and other cultural celebrations. Honors tradition while embracing contemporary style.',
  950.00,
  'Bridal & Events',
  '/images/products/product-8-main.jpg',
  14,
  true,
  true,
  true,
  'made_to_order',
  'Traditional Chitenge fabric, Embroidered details, Matching headwrap included',
  'Hand wash preferred, Dry in shade, Iron on low heat'
),
(
  'Safari Chic Jumpsuit',
  'Versatile jumpsuit with earthy tones and practical pockets. Inspired by Zambia''s beautiful wildlife and safari culture. Perfect for travel, casual events, or everyday sophistication.',
  550.00,
  'Casual Wear',
  '/images/products/product-9-main.jpg',
  7,
  true,
  false,
  false,
  'in_stock',
  'Lightweight cotton blend, Multiple pockets, Adjustable waist tie',
  'Machine wash cold, Line dry, Iron on medium heat'
),
(
  'Heritage Wrap Dress',
  'Wrap-style dress celebrating Zambian heritage patterns. This versatile piece flatters all body types with its adjustable wrap design. Features traditional motifs in a contemporary silhouette.',
  420.00,
  'Traditional Wear',
  '/images/products/product-10-main.jpg',
  7,
  true,
  true,
  true,
  'made_to_order',
  'African print cotton, Wrap-around design, Tie waist',
  'Hand wash or gentle cycle, Hang dry, Iron on reverse side'
)
ON CONFLICT DO NOTHING;

-- 8. Update products with gallery images
UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-1-main.jpg',
  '/images/products/product-1-detail-1.jpg',
  '/images/products/product-1-detail-2.jpg',
  '/images/products/product-1-lifestyle.jpg'
] WHERE name = 'Zambian Sunset Chitenge Dress';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-2-main.jpg',
  '/images/products/product-2-detail-1.jpg',
  '/images/products/product-2-detail-2.jpg',
  '/images/products/product-2-lifestyle.jpg'
] WHERE name = 'Executive Kaunda Suit';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-3-main.jpg',
  '/images/products/product-3-detail-1.jpg',
  '/images/products/product-3-detail-2.jpg',
  '/images/products/product-3-lifestyle.jpg'
] WHERE name = 'Lusaka Business Blazer';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-4-main.jpg',
  '/images/products/product-4-detail-1.jpg',
  '/images/products/product-4-detail-2.jpg',
  '/images/products/product-4-lifestyle.jpg'
] WHERE name = 'Victoria Falls Evening Gown';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-5-main.jpg',
  '/images/products/product-5-detail-1.jpg',
  '/images/products/product-5-detail-2.jpg',
  '/images/products/product-5-lifestyle.jpg'
] WHERE name = 'Kafue Casual Dress';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-6-main.jpg',
  '/images/products/product-6-detail-1.jpg',
  '/images/products/product-6-detail-2.jpg',
  '/images/products/product-6-lifestyle.jpg'
] WHERE name = 'Copper Belt Shirt';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-7-main.jpg',
  '/images/products/product-7-detail-1.jpg',
  '/images/products/product-7-detail-2.jpg',
  '/images/products/product-7-lifestyle.jpg'
] WHERE name = 'Bridal Elegance Gown';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-8-main.jpg',
  '/images/products/product-8-detail-1.jpg',
  '/images/products/product-8-detail-2.jpg',
  '/images/products/product-8-lifestyle.jpg'
] WHERE name = 'Matebeto Ceremony Dress';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-9-main.jpg',
  '/images/products/product-9-detail-1.jpg',
  '/images/products/product-9-detail-2.jpg',
  '/images/products/product-9-lifestyle.jpg'
] WHERE name = 'Safari Chic Jumpsuit';

UPDATE products SET gallery_images = ARRAY[
  '/images/products/product-10-main.jpg',
  '/images/products/product-10-detail-1.jpg',
  '/images/products/product-10-detail-2.jpg',
  '/images/products/product-10-lifestyle.jpg'
] WHERE name = 'Heritage Wrap Dress';

