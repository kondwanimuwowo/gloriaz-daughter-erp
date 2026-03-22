# Database Restructuring Migration Guide

## Overview

This guide walks you through the finished goods consolidation migration, which moves the single source of truth for finished goods from the `materials` table to the `products` table.

**Status**: Phase 3 ✅ Complete | Phase 4 (Migration & Testing) → 🚀 Ready to Execute

---

## What Changed?

### Before (Dual-Table Architecture)
- **Products Table**: Custom designs only
- **Materials Table**: Raw materials + Finished goods (via `material_type` discriminator)
- **Catalog**: Joined two tables, complex queries

### After (Single-Table Architecture)
- **Products Table**: Custom designs + Finished goods (via `product_type` discriminator)
- **Materials Table**: Raw materials only (unchanged, used for inventory tracking)
- **Catalog**: Single table, simpler queries, faster performance

---

## Migration Steps

### Step 1: Run the Restructuring Migration

The base restructuring migration has already been created:
- **File**: `supabase/migrations/005_restructure_products_table.sql`
- **What it does**: Adds `product_type`, `stock_quantity`, `min_stock_level`, `cost_per_unit` columns to products table

**To run this migration:**

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the contents of `supabase/migrations/005_restructure_products_table.sql`
4. Execute the query
5. Verify no errors in the output

### Step 2: Run the Data Migration

The data migration moves existing finished goods:
- **File**: `supabase/migrations/006_migrate_finished_goods_to_products.sql`
- **What it does**: Copies finished products from materials table to products table with proper field mapping

**To run this migration:**

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the contents of `supabase/migrations/006_migrate_finished_goods_to_products.sql`
4. Execute the query
5. Verify no errors in the output

### Step 3: Verify the Migration

The app includes a verification component to check migration status:

```javascript
import { MigrationVerification } from "@/components/MigrationVerification";

// In a page or dashboard:
<MigrationVerification />
```

Or use the migration service directly:

```javascript
import { verifyMigration, getInventorySummary, getLowStockItems } from "@/services/migrationService";

// Verify migration completed
const status = await verifyMigration();
console.log(status);

// Get inventory overview
const summary = await getInventorySummary();
console.log(summary);

// Check for low stock
const lowStock = await getLowStockItems();
console.log(lowStock);
```

---

## Updated Components

### ERP Products Page (`src/pages/Products.jsx`)

Now supports:
- **Product Type Selection**: Choose between "Custom Design" or "Finished Good"
- **Inventory Fields**: Only visible when type is "Finished Good"
  - Stock Quantity
  - Minimum Stock Level
  - Cost Per Unit
  - Active toggle
- **Enhanced View Mode**: Shows appropriate metrics based on product type

**New Form Fields:**
```jsx
product_type: "custom_design" | "finished_good"
stock_quantity: number          // For finished goods
min_stock_level: number         // For finished goods
cost_per_unit: number           // For finished goods
active: boolean                 // For finished goods
```

### Catalog (`catalog/services/catalogService.ts`)

Updated functions:
- `getProducts(category)` - Returns both custom designs and finished goods in stock
- `getCustomDesigns(category)` - Returns only custom designs
- `getFinishedGoods(category)` - Returns only finished goods with stock > 0
- `checkProductAvailability(id)` - Checks availability by type
- `getFeaturedProducts()` - Enhanced to show both types

### Migration Service (`src/services/migrationService.js`)

New utility service for inventory management:
- `verifyMigration()` - Check migration status
- `getInventorySummary()` - Get overview of products by type
- `getLowStockItems()` - Get finished goods below min stock
- `getOutOfStockItems()` - Get finished goods with zero stock
- `updateStock(productId, quantity)` - Update stock quantity
- `adjustStock(productId, delta)` - Add/subtract from stock

---

## Testing Checklist

### ✓ Database Level
- [ ] Run migration 005_restructure_products_table.sql
- [ ] Run migration 006_migrate_finished_goods_to_products.sql
- [ ] Check Supabase SQL Editor for any errors
- [ ] Query: `SELECT COUNT(*) FROM products WHERE product_type = 'finished_good'`
  - Should match count from `SELECT COUNT(*) FROM materials WHERE material_type = 'finished_product'`

### ✓ ERP Dashboard
- [ ] Create a new Custom Design product
  - No inventory fields should show
  - Should not appear in catalog with stock requirement
- [ ] Create a new Finished Good product
  - Inventory fields should be visible
  - Can set stock, min level, cost
  - Should appear in public catalog if stock > 0
- [ ] Edit existing products
  - Can toggle between product types
  - Inventory fields appear/disappear correctly
  - Data saves properly

### ✓ Public Catalog (`/catalog`)
- [ ] Browse catalog
  - Custom designs show (always)
  - Finished goods show only if stock > 0
- [ ] Submit inquiry for custom design (no stock check)
- [ ] Submit inquiry for finished good
  - WhatsApp button should show if configured
  - Inquiry should be created with product info
- [ ] Direct product URL
  - Out-of-stock finished goods return 404
  - Available finished goods load with stock info

### ✓ Real-time Features
- [ ] Update stock in ERP Products page
  - Catalog should reflect stock changes (via real-time subscriptions)
- [ ] Mark finished good as inactive
  - Should disappear from catalog immediately
- [ ] Delete custom design
  - Catalog should reflect deletion

### ✓ Inventory Management
- [ ] Low stock alerts
  - Use `MigrationVerification` component
  - Should list items below min_stock_level
- [ ] Out of stock items
  - Should not appear in catalog
  - Should be listed in inventory dashboard
- [ ] Stock adjustments
  - Use `migrationService.adjustStock()`
  - Should handle negative quantity errors

---

## Field Mapping Reference

When finished goods migrate from `materials` → `products`:

| Materials Column | Products Column | Notes |
|---|---|---|
| `name` | `name` | Product name |
| `category` | `category` | Defaults to 'finished_goods' if empty |
| `stock_quantity` | `stock_quantity` | Current inventory count |
| `min_stock_level` | `min_stock_level` | Reorder threshold |
| `cost_per_unit` | `cost_per_unit` | Production/acquisition cost |
| `selling_price` | `base_price` | What customer pays |
| `production_cost` | `cost_per_unit` | Fallback if cost_per_unit is null |
| `reorder_level` | `min_stock_level` | Fallback if min_stock_level is null |
| `product_id` | (not stored) | Link to parent product (if exists) |
| — | `product_type` | Set to 'finished_good' |
| — | `active` | Defaults to true |

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Data integrity**: The migration uses `ON CONFLICT DO NOTHING`, so it's safe to re-run
2. **Query the backup**: Finished goods remain in `materials` table
3. **Reverse field mapping**: Use the field mapping reference above to rollback to materials table
4. **RLS policies**: Original RLS policies still exist for both tables

### Quick Rollback Query (if needed):
```sql
-- Delete migrated finished goods from products (keep originals in materials)
DELETE FROM products
WHERE product_type = 'finished_good'
AND created_at > (SELECT MAX(updated_at) FROM materials WHERE material_type = 'finished_product')
AND deleted_at IS NULL;
```

---

## Next Steps

After migration is complete and tested:

1. **Monitor**: Use `MigrationVerification` dashboard to watch for stock issues
2. **Optimize**: Finished goods queries are now faster (single table)
3. **Deprecate**: Optionally deprecate `material_type = 'finished_product'` entries in materials table
4. **Integrate**: Connect other systems (inventory, accounting) to use the new structure

---

## Support

If you encounter issues:

1. Check the **Testing Checklist** above
2. Review **Field Mapping** to ensure data looks correct
3. Check Supabase logs for RLS policy errors
4. Use `verifyMigration()` to diagnose issues
5. Consult the **Rollback Plan** if needed

---

## Architecture Diagram

### Before
```
┌─────────────────┐
│   CATALOG       │
└─────────────────┘
        │
    Joins & Filters
        │
   ┌────┴────┐
   │          │
┌──▼──┐    ┌─▼──────────┐
│Prods│    │ Materials   │
└─────┘    │ (finished)  │
           └─────────────┘
```

### After
```
┌─────────────────┐
│   CATALOG       │
└─────────────────┘
        │
   Simple Queries
        │
┌──────────────────┐
│    PRODUCTS      │
│ (designs + goods)│
└──────────────────┘
```

---

**Last Updated**: 2026-03-22
**Status**: Ready for Migration
**Test Environment**: Recommended before production
