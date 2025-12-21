# Gloriaz Daughter ERP System

> **A comprehensive Enterprise Resource Planning system for fashion and tailoring businesses**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Supabase](https://img.shields.io/badge/supabase-latest-green.svg)

## 🎯 Overview

Gloriaz Daughter ERP is a complete business management system designed specifically for fashion houses, tailoring businesses, and custom clothing manufacturers. It manages everything from inventory and orders to employee time tracking and customer relationships.

## ✨ Features

### 📦 Inventory Management

- Real-time stock tracking
- Automatic low-stock alerts
- Material categorization
- Supplier management
- Add/Deduct stock operations
- Material usage analytics

### 🛍️ Order Management

- Complete order lifecycle (7 statuses)
- Material integration with orders
- Automatic inventory deduction
- Order timeline tracking
- Customer linking
- Progress visualization
- Balance and payment tracking

### 👥 Employee Management

- Clock in/out time tracking
- Attendance history
- Hours calculation
- Productivity metrics
- Role-based organization
- Payroll data export

### 👤 Customer Management

- Customer profiles
- Body measurements (12+ fields)
- Order history
- Contact information
- Customer statistics
- Search and filtering

### 📊 Analytics Dashboard

- Revenue trends (6 months)
- Order status distribution
- Material usage analysis
- Employee productivity
- Real-time business metrics
- Low stock monitoring

## 🚀 Technology Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **Shadcn UI** - Component library
- **TanStack Table** - Advanced data tables
- **TanStack Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Lucide React** - Icons

### State Management

- **Zustand** - Global state management
- **React Hot Toast** - Notifications
- **Context API** - Theme & Auth state

### Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

### Development Tools

- **Vite** - Build tool
- **ESLint** - Code linting
- **date-fns** - Date manipulation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Modern web browser

## ⚡ Quick Start

### 1. Clone and Install

```bash
# Create project
npm create vite@latest gloriaz-daughter-erp -- --template react
cd gloriaz-daughter-erp

# Install dependencies
npm install @supabase/supabase-js react-router-dom zustand framer-motion lucide-react react-hook-form date-fns recharts react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Environment

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Database

Run the SQL scripts from `COMPLETE_DATABASE_SCHEMA.sql` in your Supabase SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard charts
│   ├── inventory/       # Inventory components
│   ├── orders/          # Order components
│   ├── employees/       # Employee components
│   └── customers/       # Customer components
├── pages/               # Page components
├── services/            # API services
├── store/               # State management
├── lib/                 # Utility libraries
├── App.jsx
└── main.jsx
```

## 🎨 Key Components

### Common Components

- `Button` - Styled button with variants
- `Card` - Container component
- `Input` - Form input with validation
- `Modal` - Popup dialogs

### Layout Components

- `Layout` - Main app layout
- `Sidebar` - Navigation sidebar
- `Navbar` - Top navigation bar

### Feature Components

- Material cards, forms, and modals
- Order management components
- Employee time tracking
- Customer profiles

## 🔄 Order Workflow

```
Enquiry → Contacted → Measurements → Production → Fitting → Completed → Delivered
```

**Key Points:**

- Materials automatically deducted at "Production" stage
- Timeline tracks all status changes
- Notifications at each stage (coming soon)

## 💾 Data Models

### Materials

```javascript
{
  (name,
    category,
    unit,
    stock_quantity,
    min_stock_level,
    cost_per_unit,
    supplier);
}
```

### Orders

```javascript
{
  order_number, customer_id, status, total_cost,
  deposit, balance, materials[], timeline[]
}
```

### Employees

```javascript
{
  (name, role, phone, email, hire_date, hourly_rate, active);
}
```

### Customers

```javascript
{
  name, phone, email, address,
  measurements{}, orders[]
}
```

## 🎯 Usage Examples

### Adding Material

```javascript
await inventoryService.addMaterial({
  name: "Silk Fabric - Red",
  category: "fabric",
  unit: "meters",
  stock_quantity: 50,
  min_stock_level: 10,
  cost_per_unit: 25.0,
});
```

### Creating Order

```javascript
await orderService.createOrder({
  customer_id: "...",
  due_date: "2024-12-31",
  description: "Wedding dress",
  materials: [{ material_id: "...", quantity_used: 3.5 }],
  total_cost: 450.0,
});
```

## 📊 Analytics Features

- **Revenue Trend**: 6-month revenue visualization
- **Order Distribution**: Pie chart of order statuses
- **Material Usage**: Top materials consumed
- **Employee Productivity**: Hours and orders completed

## 🔐 Security (Coming Soon)

- User authentication
- Role-based access control
- Row-level security
- Audit logging

## 🚧 Roadmap

### Phase 1 (Current)

- ✅ Inventory Management
- ✅ Order Management
- ✅ Employee Tracking
- ✅ Customer Management
- ✅ Analytics Dashboard

### Phase 2 (Next)

- ⏳ Authentication & Authorization
- ⏳ Email/SMS Notifications
- ⏳ Invoice Generation
- ⏳ Payment Tracking

### Phase 3 (Future)

- 📋 Supplier Portal
- 📋 Mobile App
- 📋 WhatsApp Integration
- 📋 Advanced Reporting

## 🤝 Contributing

1. Follow existing code structure
2. Use TypeScript for new features (migration planned)
3. Add tests for critical features
4. Update documentation
5. Follow commit message conventions

## 📝 Documentation

- [Setup Guide](PROJECT_SETUP_GUIDE.md)
- [Quick Reference](QUICK_REFERENCE_GUIDE.md)
- [Database Schema](COMPLETE_DATABASE_SCHEMA.sql)

## 🐛 Known Issues

- None reported yet

## 📜 License

Private and proprietary - © 2024 Gloriaz Daughter

## 👥 Team

- **Developer**: [Your Name]
- **Client**: Gloriaz Daughter

## 📞 Support

For issues or questions:

- Check documentation first
- Review error messages
- Contact system administrator

---

**Built with ❤️ for Gloriaz Daughter**

_Making fashion business management beautiful and efficient_
