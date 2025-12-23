# Inventory History & Restock Price Enhancement

## Tasks

### Database Schema Updates
- [x] Add `order_id` column to `inventory_transactions` table
- [x] Add `unit_cost` column to `inventory_transactions` table for tracking restock prices
- [x] Create migration script

### Backend Service Updates
- [x] Update `inventoryService.updateStock()` to accept and save `order_id` and `unit_cost`
- [x] Modify transaction logging to include order reference and cost data

### Store Updates
- [x] Update `useInventoryStore.updateStock()` to pass through `order_id` and `unit_cost`

### UI Component Updates
- [x] Enhance `StockUpdateModal` to include:
  - Order ID field (optional) for linking to orders
  - Price toggle for restocking (same price vs new price) - default to "same price"
  - New price input field when restocking at different price
- [x] Update `Inventory.jsx` history table to display:
  - Order ID/reference when available
  - Reason/notes column (already exists but needs verification)
- [x] Update inventory value calculation when restocking at different price

### Testing
- [ ] Test stock usage with reason/note display in history
- [ ] Test stock usage with order attachment
- [ ] Test restocking at same price
- [ ] Test restocking at different price with proper value calculation
- [ ] Verify history modal shows all information correctly
