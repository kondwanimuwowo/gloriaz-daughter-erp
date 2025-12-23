# Database Migration Instructions

## Migration: Add Order Tracking and Unit Cost to Inventory Transactions

This migration adds two new columns to the `inventory_transactions` table to support:
1. Linking transactions to specific orders
2. Tracking the unit cost at the time of each transaction (for weighted average cost calculations)

### How to Apply This Migration

#### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migration_add_inventory_transaction_fields.sql`
5. Click **Run** to execute the migration

#### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

Or manually execute:

```bash
psql -h [your-db-host] -U postgres -d postgres -f migration_add_inventory_transaction_fields.sql
```

### What This Migration Does

- Adds `order_id UUID` column (nullable, references orders table)
- Adds `unit_cost DECIMAL(10,2)` column (nullable)
- Creates an index on `order_id` for faster lookups
- Adds documentation comments to the new columns

### Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the index
DROP INDEX IF EXISTS idx_inventory_transactions_order;

-- Remove the columns
ALTER TABLE inventory_transactions DROP COLUMN IF EXISTS order_id;
ALTER TABLE inventory_transactions DROP COLUMN IF EXISTS unit_cost;
```

### Verification

After running the migration, verify it worked:

```sql
-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_transactions'
ORDER BY ordinal_position;
```

You should see `order_id` and `unit_cost` in the column list.
