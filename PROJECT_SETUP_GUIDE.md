# Gloriaz Daughter ERP - Complete Setup Guide

## 📋 Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Code editor (VS Code recommended)

## 🚀 Installation Steps

### 1. Create React Project
```bash
npm create vite@latest gloriaz-daughter-erp -- --template react
cd gloriaz-daughter-erp
npm install
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js
npm install react-router-dom
npm install zustand
npm install framer-motion
npm install lucide-react
npm install react-hook-form
npm install date-fns
npm install recharts
npm install react-hot-toast

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind CSS
Replace `tailwind.config.js` with the provided configuration.

### 4. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

#### Create `.env` file
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Run Database Migrations
Execute the SQL scripts in your Supabase SQL Editor in this order:

1. **Create Tables** (materials, customers, employees, attendance, orders, order_items, order_materials, order_timeline)
2. **Create Functions** (generate_order_number, set_order_number, update_updated_at_column)
3. **Create Triggers** (trigger_set_order_number, update triggers for all tables)
4. **Create Indexes** (for better performance)
5. **Insert Sample Data** (optional)

### 5. Project Structure
```
gloriaz-daughter-erp/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   ├── dashboard/
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── OrderStatusChart.jsx
│   │   │   ├── MaterialUsageChart.jsx
│   │   │   └── EmployeeProductivityChart.jsx
│   │   ├── inventory/
│   │   │   ├── MaterialCard.jsx
│   │   │   ├── AddMaterialForm.jsx
│   │   │   ├── StockUpdateModal.jsx
│   │   │   └── LowStockAlert.jsx
│   │   ├── orders/
│   │   │   ├── OrderCard.jsx
│   │   │   ├── OrderStatusBadge.jsx
│   │   │   ├── CreateOrderForm.jsx
│   │   │   ├── OrderDetailsView.jsx
│   │   │   ├── OrderTimeline.jsx
│   │   │   └── MaterialSelector.jsx
│   │   ├── employees/
│   │   │   ├── EmployeeCard.jsx
│   │   │   ├── AddEmployeeForm.jsx
│   │   │   ├── ClockInOut.jsx
│   │   │   ├── TodayAttendance.jsx
│   │   │   └── AttendanceTable.jsx
│   │   └── customers/
│   │       ├── CustomerCard.jsx
│   │       ├── AddCustomerForm.jsx
│   │       ├── MeasurementsForm.jsx
│   │       └── CustomerDetailsView.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Orders.jsx
│   │   ├── Employees.jsx
│   │   └── Customers.jsx
│   ├── services/
│   │   ├── inventoryService.js
│   │   ├── orderService.js
│   │   ├── employeeService.js
│   │   ├── customerService.js
│   │   └── analyticsService.js
│   ├── store/
│   │   ├── useInventoryStore.js
│   │   ├── useOrderStore.js
│   │   ├── useEmployeeStore.js
│   │   └── useCustomerStore.js
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📦 Modules Implemented

### ✅ Inventory Management
- Material CRUD operations
- Stock tracking (add/deduct)
- Low stock alerts
- Category filtering
- Search functionality

### ✅ Employee Time Tracking
- Employee management
- Clock in/out system
- Attendance tracking
- Hours calculation
- Productivity reports

### ✅ Order Management
- Full order lifecycle (7 statuses)
- Material integration
- Automatic inventory deduction
- Order timeline
- Customer linking

### ✅ Customer Management
- Customer profiles
- Body measurements (12+ fields)
- Order history
- Customer statistics
- Search and filter

### ✅ Dashboard Analytics
- Revenue trends (6 months)
- Order status distribution
- Material usage analysis
- Employee productivity
- Real-time statistics

## 🔧 Key Features

1. **Real-time Updates** - All data syncs with Supabase
2. **Responsive Design** - Works on desktop and mobile
3. **Beautiful Animations** - Framer Motion throughout
4. **Form Validation** - React Hook Form integration
5. **Toast Notifications** - User feedback for all actions
6. **Search & Filter** - Quick data access
7. **Export Functionality** - CSV exports for reports

## 🎨 Design System

### Colors
- Primary: Pink (#ec4899)
- Success: Green (#10b981)
- Warning: Yellow (#eab308)
- Danger: Red (#ef4444)
- Info: Blue (#3b82f6)

### Components
- All components use Tailwind CSS
- Consistent spacing and borders
- Hover effects and transitions
- Mobile-first approach

## 📊 Database Schema

### Tables
1. **materials** - Inventory items
2. **customers** - Customer information
3. **employees** - Staff management
4. **attendance** - Time tracking
5. **orders** - Order management
6. **order_items** - Order line items
7. **order_materials** - Materials per order
8. **order_timeline** - Status history

## 🚧 Next Steps (Not Implemented Yet)

1. **Authentication**
   - User login/logout
   - Role-based access control
   - Protected routes

2. **Advanced Features**
   - Email/SMS notifications
   - Invoice generation
   - Payment tracking
   - Backup/restore

3. **Integrations**
   - Payment gateways
   - Email service
   - SMS service
   - WhatsApp Business API

## 🐛 Troubleshooting

### Common Issues

**1. Supabase Connection Error**
- Check .env file variables
- Verify Supabase project is active
- Check internet connection

**2. Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

**3. Styling Issues**
- Rebuild Tailwind: `npx tailwindcss -i ./src/index.css -o ./dist/output.css`

## 📝 Testing Workflow

1. Add materials to inventory
2. Create employees
3. Clock employees in/out
4. Add customers
5. Create orders with materials
6. Move orders through statuses
7. Check dashboard analytics

## 🤝 Contributing

When adding new features:
1. Follow existing folder structure
2. Use consistent naming conventions
3. Add error handling
4. Include loading states
5. Test thoroughly

## 📄 License

This project is private and proprietary to Gloriaz Daughter.
