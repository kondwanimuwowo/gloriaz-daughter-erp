# Gloriaz Daughter ERP - Quick Reference Guide

## 🎯 Common Tasks

### Adding New Material
1. Navigate to **Inventory**
2. Click **Add Material**
3. Fill in: Name, Category, Unit, Stock Quantity, Min Stock Level, Cost per Unit
4. Optional: Supplier, Description
5. Click **Add Material**

### Creating an Order
1. Navigate to **Orders**
2. Click **Create Order**
3. Select Customer (or add new)
4. Set Due Date and Assign Tailor (optional)
5. Add Order Description
6. **Add Materials** - Click "Add Material", select material, enter quantity
7. Set Total Cost (auto-calculated from materials)
8. Enter Deposit amount
9. Click **Create Order**

### Employee Clock In/Out
1. Navigate to **Employees**
2. In the **Time Clock** card, select employee
3. Click **Clock In** at start of shift
4. Click **Clock Out** at end of shift
5. Hours automatically calculated

### Adding Customer Measurements
1. Navigate to **Customers**
2. Click **View** on customer card
3. Click **Add Measurements** (or **Update** if exists)
4. Enter measurements in inches
5. Add notes if needed
6. Click **Save Measurements**

### Moving Order Status
1. Navigate to **Orders**
2. Click **View** on order card
3. In right sidebar, see current status
4. Click button to move to next status (e.g., "Move to Production")
5. Add notes (optional)
6. Confirm

**Note:** Materials are automatically deducted when order moves to "Production" status!

### Checking Low Stock
1. **Dashboard** - See "Low Stock Items" stat
2. **Inventory** - Red "Low Stock Alert" card at top
3. Items show when stock ≤ minimum stock level

### Exporting Reports
1. **Attendance Report**
   - Navigate to Employees
   - Click "Attendance" on employee card
   - Select date range
   - Click **Export CSV**

## 📱 Module Overview

### Dashboard
- **Stats Cards**: Total Revenue, Orders, Customers, Low Stock
- **Revenue Chart**: Last 6 months trend
- **Order Status**: Pie chart distribution
- **Material Usage**: Top materials used
- **Employee Productivity**: Hours and orders completed
- **Recent Orders**: Last 5 orders
- **Low Stock Alerts**: Materials needing restock

### Inventory
- **Material Cards**: Visual grid of all materials
- **Search**: By name, category, or supplier
- **Filter**: By category
- **Actions**: Add, Edit, Delete, Add Stock, Use Stock
- **Low Stock Alerts**: Highlighted in red

### Orders
- **Order Cards**: Visual grid with progress bars
- **Search**: By order number, customer, description
- **Filter**: By status
- **Status Flow**: 
  1. Enquiry → 
  2. Contacted → 
  3. Measurements → 
  4. Production → 
  5. Fitting → 
  6. Completed → 
  7. Delivered

### Employees
- **Employee Cards**: Contact info, role, stats
- **Time Clock**: Real-time clock in/out
- **Today's Attendance**: Live view of who's working
- **Attendance Reports**: Historical data with export

### Customers
- **Customer Cards**: Contact, order count, measurements status
- **Customer Profile**: Full details, measurements, order history
- **Measurements**: 12+ body measurements
- **Statistics**: Total orders, spending, last order date

## 🎨 Color Coding

### Order Status
- **Grey**: Enquiry
- **Blue**: Contacted
- **Purple**: Measurements
- **Yellow**: Production
- **Orange**: Fitting
- **Green**: Completed
- **Emerald**: Delivered
- **Red**: Cancelled

### Stock Levels
- **Green**: Above minimum
- **Red**: At or below minimum

### Employee Status
- **Green**: Clocked in
- **Grey**: Clocked out

## ⚡ Keyboard Shortcuts

- **Search**: Click search bar in navbar (Ctrl+K coming soon)
- **Navigation**: Use sidebar for quick module switching

## 🔍 Search Tips

### Inventory
- Search by: Material name, category, supplier
- Example: "silk", "fabric", "ABC Textiles"

### Orders
- Search by: Order number, customer name, description
- Example: "GD-2024-0001", "Martha", "wedding"

### Employees
- Search by: Name, role, email
- Example: "Jane", "tailor", "jane@"

### Customers
- Search by: Name, phone, email
- Example: "Martha", "+260", "@email.com"

## 🎯 Best Practices

### Material Management
1. Set realistic minimum stock levels
2. Update stock immediately after restocking
3. Regular weekly stock checks
4. Keep supplier information updated

### Order Management
1. Always add materials to orders
2. Move status promptly to keep timeline accurate
3. Add notes at each status change
4. Collect deposits before production

### Employee Management
1. Clock in/out daily for accurate hours
2. Review weekly attendance
3. Export monthly reports for payroll
4. Update employee info when changes occur

### Customer Management
1. Save measurements before first order
2. Update measurements if customer requests
3. Add notes about preferences
4. Track order history for loyalty

## ⚠️ Important Notes

### Material Deduction
- Materials are **automatically deducted** when order status changes to "Production"
- Check inventory before moving to production
- Cannot be undone - ensure order is ready!

### Data Persistence
- All data is stored in Supabase
- Real-time updates across all sessions
- No local storage used

### Mobile Access
- Fully responsive design
- Works on tablets and phones
- Best viewed on desktop for data entry

## 🐛 Common Issues & Solutions

### "Already clocked in for today"
- **Cause**: Employee already has an active clock-in
- **Solution**: Clock out first, then clock in again

### "Insufficient stock"
- **Cause**: Material stock is lower than order quantity
- **Solution**: Restock material or reduce order quantity

### "Customer is required"
- **Cause**: No customer selected in order
- **Solution**: Select existing customer or create new one

### "No clock-in record found"
- **Cause**: Trying to clock out without clocking in
- **Solution**: Clock in first

## 📊 Report Schedule

### Daily
- Check today's attendance
- Review new orders
- Monitor low stock alerts

### Weekly
- Review order pipeline
- Check material usage
- Export attendance for payroll prep

### Monthly
- Dashboard analytics review
- Revenue analysis
- Employee productivity
- Customer growth

## 🔒 Data Safety

- Always verify before deleting
- Export important reports regularly
- Keep backups of critical data
- Maintain Supabase project access

## 📞 Support

For technical issues:
1. Check this guide first
2. Review error messages
3. Check browser console (F12)
4. Contact system administrator

---

**Last Updated**: December 2024
**Version**: 1.0.0
