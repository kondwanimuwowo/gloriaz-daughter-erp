-- ============================================
-- MIGRATION: Add order_id and unit_cost to inventory_transactions
-- ============================================
-- This migration adds support for:
-- 1. Linking inventory transactions to orders
-- 2. Tracking the unit cost at the time of transaction (especially for restocks)

-- Add order_id column (optional reference to orders)
ALTER TABLE inventory_transactions
ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add unit_cost column (track cost per unit at time of transaction)
ALTER TABLE inventory_transactions
ADD COLUMN unit_cost DECIMAL(10, 2);

-- Create index for order_id lookups
CREATE INDEX idx_inventory_transactions_order ON inventory_transactions(order_id);

-- Add comment for documentation
COMMENT ON COLUMN inventory_transactions.order_id IS 'Optional reference to the order that triggered this transaction';
COMMENT ON COLUMN inventory_transactions.unit_cost IS 'Cost per unit at the time of transaction (used for weighted average calculation on restocks)';
