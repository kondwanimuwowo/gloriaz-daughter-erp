-- Table for tracking purchases made through the public catalog via Lenco payment
CREATE TABLE IF NOT EXISTS catalog_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR,
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'ZMW',
  lenco_reference VARCHAR NOT NULL,
  lenco_collection_id VARCHAR,
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_catalog_purchases_updated_at
BEFORE UPDATE ON catalog_purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_catalog_purchases_product ON catalog_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_purchases_reference ON catalog_purchases(lenco_reference);
CREATE INDEX IF NOT EXISTS idx_catalog_purchases_status ON catalog_purchases(status);
CREATE INDEX IF NOT EXISTS idx_catalog_purchases_created_at ON catalog_purchases(created_at);

-- RLS
ALTER TABLE catalog_purchases ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can view all purchases
CREATE POLICY "Authenticated users can view purchases"
  ON catalog_purchases FOR SELECT
  USING (auth.role() = 'authenticated');

-- The API route uses service role key, so INSERT doesn't need a public policy
-- But we add one for the service role just in case
CREATE POLICY "Service role can insert purchases"
  ON catalog_purchases FOR INSERT
  WITH CHECK (true);

-- Admin/manager can update purchase status
CREATE POLICY "Admin/manager can update purchases"
  ON catalog_purchases FOR UPDATE
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'manager')
  );
