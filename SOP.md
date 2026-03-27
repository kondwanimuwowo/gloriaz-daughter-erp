# Gloriaz Daughter ERP - Standard Operating Procedures (SOP)

**Version:** 1.0
**Last Updated:** 2026-03-26
**System:** Gloriaz Daughter ERP & Online Catalog
**Currency:** ZMW (Zambian Kwacha)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Getting Started](#2-getting-started)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Dashboard Operations](#4-dashboard-operations)
5. [Order Management](#5-order-management)
6. [Inventory Management](#6-inventory-management)
7. [Production Management](#7-production-management)
8. [Customer Management](#8-customer-management)
9. [Enquiry Management](#9-enquiry-management)
10. [Employee & Attendance Management](#10-employee--attendance-management)
11. [Finance & Costing](#11-finance--costing)
12. [Analytics & Reporting](#12-analytics--reporting)
13. [Product Catalog Management](#13-product-catalog-management)
14. [Notifications](#14-notifications)
15. [Online Catalog (Customer-Facing)](#15-online-catalog-customer-facing)
16. [Payment Processing (Lenco)](#16-payment-processing-lenco)
17. [User Administration](#17-user-administration)
18. [Settings & Configuration](#18-settings--configuration)
19. [Data Backup & Security](#19-data-backup--security)
20. [Troubleshooting](#20-troubleshooting)
21. [Environment Setup](#21-environment-setup)
22. [Database Schema Reference](#22-database-schema-reference)

---

## 1. System Overview

### 1.1 Purpose

The Gloriaz Daughter ERP system is a comprehensive business management platform designed for a bespoke fashion and tailoring house based in Zambia. It manages the complete lifecycle of custom garment production from customer inquiry through to delivery, alongside inventory, employee, financial, and catalog operations.

### 1.2 System Architecture

The system consists of two interconnected applications:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **ERP Dashboard** | React + Vite + Supabase | Internal business operations management |
| **Online Catalog** | Next.js + Supabase | Customer-facing product showcase and ordering |

**Tech Stack:**
- **Frontend (ERP):** React 18, Vite, Tailwind CSS 4, Zustand, TanStack Query, TanStack Table, Recharts, React Hook Form, Lucide React
- **Frontend (Catalog):** Next.js 15, React 19, Tailwind CSS 4, Motion, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Row-Level Security, Real-time subscriptions)
- **Payments:** Lenco API V2 (card and mobile money)
- **Exports:** XLSX (Excel export)

### 1.3 Key Business Processes

```
Customer Inquiry --> Consultation --> Measurement --> Cutting --> Production --> Fitting --> Delivery
```

---

## 2. Getting Started

### 2.1 Accessing the ERP Dashboard

1. Navigate to the ERP dashboard URL in your web browser
2. Enter your email and password on the Login screen
3. Click **Sign In**
4. You will be redirected to the Dashboard based on your assigned role

### 2.2 First-Time Setup (Admin Only)

When the system is first deployed:

1. The first admin user is created during initial setup
2. Navigate to the First-Time Setup wizard
3. Configure:
   - Business name and contact details
   - Default currency (ZMW - Zambian Kwacha)
   - Business address
   - Workshop configuration
4. Complete the setup to access the full dashboard

### 2.3 Navigation

The sidebar provides access to all modules. Items visible depend on your role:

| Module | Icon | Description |
|--------|------|-------------|
| Dashboard | LayoutDashboard | Business overview and key metrics |
| Products | Package | Product catalog management |
| Inventory | Boxes | Raw materials and stock management |
| Orders | ClipboardList | Order lifecycle management |
| Production | Factory | Production batch management |
| Customers | Users | Customer profiles and measurements |
| Enquiries | MessageSquare | Customer inquiry management (with unread badge) |
| Employees | UserCog | Staff and attendance management |
| Finance | DollarSign | Costing, expenses, and financial analysis |
| Analytics | BarChart3 | Advanced reporting and insights |
| Notifications | Bell | System alerts and updates |
| Users | Shield | User account administration |
| Settings | Settings | System configuration |

---

## 3. User Roles & Permissions

### 3.1 Role Definitions

| Role | Description | Typical Users |
|------|-------------|---------------|
| **Admin** | Full system access, user management, all configurations | Business owner, IT administrator |
| **Manager** | Operational access, financial oversight, no user management | Workshop manager, senior staff |
| **Employee** | Basic operational access, order and customer management | Tailors, front-desk staff, assistants |

### 3.2 Permission Matrix

| Module | Admin | Manager | Employee |
|--------|-------|---------|----------|
| Dashboard | Full | Full | Full |
| Products | Full | Full | View only |
| Inventory | Full CRUD | Full CRUD | No access |
| Orders | Full CRUD | Full CRUD | Full CRUD |
| Production | Full CRUD | Full CRUD | View + Update stages |
| Customers | Full CRUD | Full CRUD | Full CRUD |
| Enquiries | Full CRUD | Full CRUD | Full CRUD |
| Employees | Full CRUD | Full CRUD | No access |
| Finance | Full | Full | No access |
| Analytics | Full | Full | No access |
| Users | Full CRUD | No access | No access |
| Settings | Full | Full | No access |
| Notifications | Own | Own | Own |
| Profile | Own | Own | Own |

### 3.3 Creating User Accounts

**Procedure (Admin only):**

1. Navigate to **Users** in the sidebar
2. Click **Add User**
3. Enter the new user's:
   - Full name
   - Email address
   - Assign role (Admin, Manager, or Employee)
4. A temporary password is auto-generated
5. Share the temporary credentials with the new user securely
6. The user should change their password on first login

### 3.4 Deactivating Users

1. Navigate to **Users**
2. Find the user to deactivate
3. Click the user's action menu
4. Select **Deactivate**
5. The user will no longer be able to log in
6. Their data and history are preserved

---

## 4. Dashboard Operations

### 4.1 Overview

The Dashboard provides an executive summary of all business operations with real-time data.

### 4.2 Dashboard Components

**Stats Cards (Top Row):**
- Total Revenue (current period)
- Active Orders count
- Customers count
- Materials in Stock

**Charts:**
- **Revenue Trend** - 6-month revenue line chart
- **Order Status Distribution** - Pie chart showing orders by status
- **Material Usage** - Top materials consumption chart
- **Employee Productivity** - Productivity metrics per employee

**Alerts & Feeds:**
- **Low Stock Alerts** - Materials below minimum threshold, sorted by urgency
- **Stock Forecasting** - Predicted at-risk items based on consumption trends
- **Recent Orders** - Latest order activity feed
- **Today's Attendance** - Employee clock-in/out snapshot

### 4.3 Data Refresh

- Dashboard data refreshes automatically via TanStack Query
- Real-time subscriptions push updates for orders, inventory, and attendance
- Manual refresh: Pull down or click the refresh icon
- Recovery mechanisms auto-retry on connection issues

---

## 5. Order Management

### 5.1 Order Lifecycle

Orders follow a strict 8-stage workflow:

```
1. Enquiry
   |
2. Contacted
   |
3. Measurement
   |
4. Cutting
   |
5. Production  <-- Inventory deduction occurs here
   |
6. Fitting
   |
7. Completed
   |
8. Delivered
```

### 5.2 Creating a New Order

**Procedure:**

1. Navigate to **Orders**
2. Click **Create Order**
3. Fill in the order form:
   - **Customer:** Select existing customer or create new
   - **Product/Garment Type:** Select from catalog or specify custom
   - **Measurements:** Auto-populated from customer profile, or enter manually
   - **Materials:** Select materials to be used
   - **Special Requests:** Any customer notes or preferences
   - **Pricing:**
     - Material costs (auto-calculated)
     - Labor costs (from garment type)
     - Overhead allocation
     - Total cost
     - Deposit amount
4. Click **Submit**
5. The order is created with status "Enquiry" and an auto-generated order number (format: `GD-YYYY-XXXX`)
6. A notification is sent to relevant staff

### 5.3 Updating Order Status

**Procedure:**

1. Navigate to **Orders**
2. Click on the order to open details
3. Click **Update Status** or use the status dropdown
4. Select the next stage in the workflow
5. Add optional notes for the timeline
6. Click **Confirm**

**Important Notes:**
- Status changes are logged in the order timeline with timestamps
- Moving to "Production" automatically deducts materials from inventory
- Each status change can trigger notifications to relevant staff
- Orders cannot skip stages (sequential progression only)

### 5.4 Order Details View

The order detail view includes:
- **Header:** Order number, status badge, customer name, dates
- **Customer Info:** Contact details, linked measurements
- **Order Items:** Products/garments with quantities and pricing
- **Materials Used:** Materials allocated with quantities and costs
- **Payment Tracking:** Deposit paid, balance due, total cost
- **Timeline:** Chronological history of all status changes and notes
- **Actions:** Status update, edit, delete (soft delete)

### 5.5 Order from Enquiry Conversion

When converting an enquiry to an order:

1. Open the enquiry in **Enquiries**
2. Click **Convert to Order**
3. The system navigates to the Order creation form with pre-filled:
   - Customer name and phone
   - Product selection
   - Special requests from the enquiry
4. Complete any remaining fields
5. Submit the order
6. The enquiry is automatically marked as "Converted"

### 5.6 Payment Tracking

- Record deposits when received
- Track balance remaining
- Payment history maintained per order
- Financial data feeds into the Finance module

---

## 6. Inventory Management

### 6.1 Overview

The Inventory module tracks all raw materials and supplies used in garment production.

**Access:** Admin, Manager only

### 6.2 Adding New Materials

**Procedure:**

1. Navigate to **Inventory**
2. Click **Add Material**
3. Enter material details:
   - **Name:** Descriptive material name
   - **Category:** Fabric, Thread, Button, Zipper, Lining, Accessory, etc.
   - **Unit:** meters, yards, pieces, rolls, spools, etc.
   - **Initial Quantity:** Starting stock amount
   - **Cost Per Unit:** Purchase price in ZMW
   - **Minimum Stock Level:** Threshold for low-stock alerts
   - **Supplier:** Supplier name/details
4. Click **Save**

### 6.3 Stock Operations

**Adding Stock (Restocking):**

1. Click on a material
2. Click **Update Stock**
3. Select operation type: **Add**
4. Enter quantity to add
5. Enter cost per unit (for weighted average calculation)
6. Add notes (e.g., supplier invoice number)
7. Click **Confirm**

**Deducting Stock (Manual):**

1. Click on a material
2. Click **Update Stock**
3. Select operation type: **Deduct**
4. Enter quantity to deduct
5. Add reason/notes
6. Click **Confirm**

**Automatic Deduction:**
- When an order moves to "Production" status, allocated materials are automatically deducted
- Production batch creation also triggers material deduction
- All transactions are logged in the inventory audit trail

### 6.4 Low Stock Monitoring

- Materials below their minimum stock level trigger automatic alerts
- Low stock alerts appear on:
  - Dashboard (Low Stock Alerts section)
  - Notifications (type: `low_stock`)
- The system calculates urgency based on:
  - Current stock vs. minimum threshold
  - Consumption rate trends
  - Forecasted depletion date

### 6.5 Inventory Transactions

All stock changes are recorded in the `inventory_transactions` table:
- **Fields:** material_id, quantity_change, operation_type, order_id, notes, timestamp
- **Operation Types:** add, deduct, adjustment, production_use
- This provides a complete audit trail for inventory accountability

### 6.6 Cost Tracking

- **Weighted Average Cost:** When restocking at different prices, the system calculates a weighted average cost per unit
- **Total Inventory Value:** Automatically calculated from quantity x cost per unit
- Costs flow into order pricing and financial reports

---

## 7. Production Management

### 7.1 Overview

The Production module manages the manufacturing process through batch-based workflows.

**Access:** Admin, Manager, Employee

### 7.2 Production Batch Workflow

```
1. Batch Created (materials allocated)
   |
2. Cutting Stage
   |
3. Stitching Stage
   |
4. Finishing Stage
   |
5. Quality Check
   |
6. Completed (or Rework if quality issues)
```

### 7.3 Creating a Production Batch

**Procedure:**

1. Navigate to **Production**
2. Click **Create Batch**
3. Fill in batch details:
   - **Product:** Select from product catalog
   - **Quantity:** Number of units to produce
   - **Materials:** Select and allocate materials
     - The system validates material availability
     - Insufficient stock will prevent batch creation
   - **Assigned Employees:** Assign staff to the batch
   - **Notes:** Production instructions or specifications
4. Click **Create**
5. A batch number is auto-generated (format: `BATCH-YYYYMM-XXX`)
6. Materials are deducted from inventory
7. Production stages are initialized

### 7.4 Stage Management

Each batch progresses through stages:

| Stage | Description | Key Actions |
|-------|-------------|-------------|
| **Cutting** | Material cutting per patterns | Assign cutter, mark complete |
| **Stitching** | Main garment assembly | Assign tailor, track progress |
| **Finishing** | Hemming, button attachment, pressing | Assign finisher, quality notes |
| **Quality Check** | Final inspection | Pass/fail, note issues, approve or rework |

**Updating a Stage:**

1. Open the production batch
2. Click on the current stage
3. Update status (In Progress, Completed, Rework Needed)
4. Assign or reassign employees
5. Add notes or quality issues
6. Click **Save**
7. When all stages complete, the batch status updates to "Completed"

### 7.5 Quality Control

- Quality issues are logged per stage
- Failed quality checks route the batch to "Rework"
- Rework loops back to the appropriate stage
- Complete quality history is maintained for each batch

### 7.6 Production Analytics

- Average stage durations
- Bottleneck detection (slowest stages)
- Employee productivity per stage
- Material consumption analysis
- Cost tracking per batch (materials + labor)
- Production completion rates

### 7.7 Production Logs

Every action on a batch is recorded:
- Who made the change
- What was changed
- When it was changed
- Previous and new values
- This creates a complete audit trail for accountability

---

## 8. Customer Management

### 8.1 Overview

The Customers module manages customer profiles, body measurements, and order history.

**Access:** All authenticated users

### 8.2 Adding a Customer

**Procedure:**

1. Navigate to **Customers**
2. Click **Add Customer**
3. Enter customer information:
   - **Full Name** (required)
   - **Phone Number** (required)
   - **Email Address**
   - **Address**
   - **Notes**
4. Click **Save**

### 8.3 Body Measurements

Customer measurements are stored in a flexible JSONB format supporting 12+ measurement fields:

| Measurement | Description |
|------------|-------------|
| Chest/Bust | Circumference at fullest point |
| Waist | Natural waistline circumference |
| Hips | Circumference at widest point |
| Shoulder Width | Across the back, shoulder to shoulder |
| Sleeve Length | Shoulder to wrist |
| Inseam | Crotch to ankle |
| Outseam | Waist to ankle |
| Neck | Neck circumference |
| Back Length | Nape to waist |
| Front Length | Shoulder to waist (front) |
| Arm Circumference | Around the upper arm |
| Thigh | Circumference at widest point |

**Recording Measurements:**

1. Open the customer profile
2. Click **Measurements** tab
3. Enter or update measurement values
4. Click **Save**
5. Measurements auto-populate when creating orders for this customer

### 8.4 Customer Details View

The customer detail view includes:
- **Profile:** Name, contact, address
- **Measurements:** Full body measurement card
- **Order History:** All orders for this customer with status
- **Statistics:** Total orders, total spent, average order value
- **Timeline:** Customer interaction history

### 8.5 Customer Search

- Search by name, phone, or email
- Filter by recent activity
- Quick-link to create an order for a customer

---

## 9. Enquiry Management

### 9.1 Overview

The Enquiries module manages customer inquiries received from the online catalog and other channels.

**Access:** All authenticated users

### 9.2 How Enquiries Arrive

Enquiries are created when:
- A customer submits an inquiry form on the online catalog
- A customer fills out the "Book Fitting" form
- Staff manually creates an enquiry

Each new enquiry triggers:
- A notification to all staff (type: `new_inquiry`)
- The unread count badge updates on the Enquiries sidebar item (refreshes every 30 seconds)

### 9.3 Enquiry Statuses

| Status | Color | Description |
|--------|-------|-------------|
| **New** | Red | Unread inquiry, requires attention |
| **Contacted** | Amber | Staff has reached out to the customer |
| **Converted** | Green | Inquiry converted into an order |
| **Dismissed** | Gray | Inquiry dismissed (not viable) |

### 9.4 Enquiry Statistics

The top of the Enquiries page shows stats cards:
- **Total Inquiries** - All-time count
- **New** - Pending inquiries requiring attention
- **Contacted** - Inquiries where staff has followed up
- **Converted** - Successfully converted to orders

### 9.5 Managing Enquiries

**Viewing Details:**
1. Click on any enquiry row in the table
2. A detail modal opens showing:
   - Customer name, phone, email
   - Product of interest (with image)
   - Preferred size
   - Contact method preference
   - Special requests
   - Staff notes
   - Status and timestamps

**Mark as Contacted:**
1. Open the enquiry detail
2. Click **Mark as Contacted**
3. The status changes and `contacted_at` timestamp is recorded

**Add Staff Notes:**
1. Open the enquiry detail
2. Click **Add Notes**
3. Enter internal notes about the interaction
4. Click **Save**
5. Notes are visible to all staff but not to the customer

**Convert to Order:**
1. Open the enquiry detail
2. Click **Convert to Order**
3. You are redirected to the Order creation form with:
   - Customer name and phone pre-filled
   - Product pre-selected
   - Special requests carried over
   - A blue info banner showing "Creating order from enquiry by [name]"
4. Complete the order form and submit
5. The enquiry status automatically updates to "Converted"
6. The order ID is linked to the enquiry

**Dismiss Enquiry:**
1. Open the enquiry detail
2. Click **Dismiss**
3. Confirm the dismissal in the dialog
4. Add an optional reason
5. The enquiry is marked as "Dismissed"

### 9.6 Enquiry Data Table

The data table displays:
- Date received
- Customer name
- Phone number
- Product of interest
- Preferred size
- Contact method
- Status (color-coded badge)
- Quick actions

---

## 10. Employee & Attendance Management

### 10.1 Overview

The Employees module manages staff records, time tracking, and productivity metrics.

**Access:** Admin, Manager only

### 10.2 Adding an Employee

**Procedure:**

1. Navigate to **Employees**
2. Click **Add Employee**
3. Enter employee details:
   - **Full Name** (required)
   - **Role/Position** (e.g., Tailor, Cutter, Manager)
   - **Email**
   - **Phone**
   - **Hire Date**
   - **Hourly Rate** (in ZMW)
4. Click **Save**

### 10.3 Time Tracking

**Clock In:**
1. Open the employee's profile
2. Click **Clock In**
3. The system records the current time as clock-in
4. The employee appears as "Active" in Today's Attendance

**Clock Out:**
1. Open the employee's profile
2. Click **Clock Out**
3. Hours worked are automatically calculated
4. The attendance record is completed

**Attendance Records:**
- Daily records with clock-in/out times
- Hours worked per day (auto-calculated)
- Weekly and monthly summaries
- Historical attendance data

### 10.4 Employee Details View

- **Profile:** Name, role, contact, hire date, hourly rate
- **Attendance:** Calendar view of attendance records
- **Productivity:** Orders completed, production stages handled
- **Statistics:** Average hours/day, total hours, attendance rate

### 10.5 Productivity Metrics

The system tracks per employee:
- Number of orders handled
- Production stages completed
- Average time per stage
- Quality issue rate
- Active orders count

---

## 11. Finance & Costing

### 11.1 Overview

The Finance module manages garment costing, overhead tracking, and financial analysis.

**Access:** Admin, Manager only

### 11.2 Garment Type Management

Garment types define the base labor costs for different product categories.

**Adding a Garment Type:**

1. Navigate to **Finance**
2. Open the **Garment Types** tab
3. Click **Add Garment Type**
4. Enter:
   - **Name** (e.g., Suit, Dress, Shirt, Trousers)
   - **Base Labor Cost** (in ZMW)
   - **Complexity Level** (Simple, Standard, Complex, Premium)
   - **Estimated Hours** to complete
5. Click **Save**

### 11.3 Overhead Cost Management

Track and allocate overhead costs:

**Adding Overhead Costs:**

1. Navigate to **Finance**
2. Open the **Overhead** tab
3. Click **Add Overhead**
4. Enter:
   - **Name** (e.g., Rent, Electricity, Equipment Maintenance)
   - **Amount** (in ZMW)
   - **Period** (Monthly, Quarterly, Annual)
   - **Category**
5. Click **Save**

### 11.4 Order Costing Breakdown

Each order's cost is calculated as:

```
Total Cost = Material Costs + Labor Cost + Overhead Allocation
```

Where:
- **Material Costs** = Sum of (quantity used x cost per unit) for each material
- **Labor Cost** = Base labor cost from garment type
- **Overhead Allocation** = Proportional share of business overheads

### 11.5 Financial Analysis

**Period Analysis:**
- View profit/loss by Monthly, Quarterly, or Annual periods
- Revenue vs. costs comparison
- Margin calculations

**Available Reports:**
- Revenue summary
- Expense breakdown
- Payment records
- Payroll overview

### 11.6 Excel Exports

Export financial data to Excel:

1. Navigate to **Finance**
2. Select the report type
3. Set the date range
4. Click **Export to Excel**
5. Available exports:
   - Expense reports
   - Payment records
   - Financial summaries
   - Payroll data with hourly breakdowns

---

## 12. Analytics & Reporting

### 12.1 Overview

The Analytics module provides advanced insights and trend analysis across all business operations.

**Access:** Admin, Manager only

### 12.2 Available Analytics

**Customer Analytics:**
- Top customers by spending
- Customer order frequency
- Customer acquisition trends
- Average order value per customer

**Order Analytics:**
- Order volume trends (6-month view)
- Status distribution
- Average order completion time
- Revenue per order type

**Profitability Analysis:**
- Revenue vs. costs (6-month trend)
- Margin percentages
- Most profitable garment types
- Cost breakdown analysis

**Inventory Analytics:**
- Material consumption trends
- Inventory turnover rates
- Cost of goods analysis
- Stock forecasting

**Employee Analytics:**
- Productivity comparisons
- Hours worked trends
- Output per employee
- Efficiency metrics

### 12.3 Filtering

All analytics support advanced filtering:
- **Date Range:** Custom start/end dates
- **Customer:** Filter by specific customer
- **Employee:** Filter by specific employee
- **Status:** Filter by order status
- **Amount Range:** Filter by monetary value

### 12.4 Chart Types

The system uses various chart types:
- **Line Charts:** Revenue trends, time series
- **Bar Charts:** Comparisons, rankings
- **Pie/Donut Charts:** Distribution, proportions
- **Dual-Axis Charts:** Revenue vs. costs overlay

---

## 13. Product Catalog Management

### 13.1 Overview

The Products module manages the product catalog that powers both the ERP and the online catalog.

### 13.2 Product Types

| Type | Description | Inventory Tracked |
|------|-------------|-------------------|
| **Custom Design** | Bespoke designs made to order | No (made per order) |
| **Finished Good (RTW)** | Ready-to-wear items in stock | Yes (stock_quantity) |

### 13.3 Adding a Product

**Procedure:**

1. Navigate to **Products**
2. Click **Add Product**
3. Enter product details:
   - **Name** (required)
   - **Description**
   - **Category** (e.g., Dresses, Suits, Shirts, Accessories)
   - **Product Type:** Custom Design or Finished Good
   - **Base Price** (in ZMW)
   - **Labor Cost** (in ZMW)
   - **Estimated Production Days** (for custom designs)
   - **Stock Quantity** (for finished goods only)
   - **Active Status** (toggle on/off for catalog visibility)
4. Upload product images:
   - Main image (required)
   - Detail images (up to 2)
   - Lifestyle image (optional)
5. Click **Save**

### 13.4 Image Management

Product images are stored in Supabase Storage:
- **Supported formats:** JPG, PNG, WebP
- **Naming convention:** `product-{number}-main.jpg`, `product-{number}-detail-1.jpg`, etc.
- **Storage location:** `catalog/public/images/products/`
- Images are validated for type and size before upload

### 13.5 Catalog Visibility

- **Active products** appear in the online catalog
- **Inactive products** are hidden from customers but retained in the system
- **Finished goods** only appear if `stock_quantity > 0`
- **Custom designs** always appear if active (they are made to order)

---

## 14. Notifications

### 14.1 Notification Types

| Type | Icon | Trigger | Description |
|------|------|---------|-------------|
| `low_stock` | AlertTriangle (amber) | Material below minimum | "[Material] is running low" |
| `order_update` | ShoppingBag (blue) | Order status change | "[Order] status updated to [Status]" |
| `production_complete` | CheckCircle (green) | Batch completion | "Batch [Number] completed" |
| `new_inquiry` | MessageSquare (purple) | Customer inquiry received | "New inquiry from [Customer]" |
| `system` | Info (gray) | System events | Admin announcements, maintenance |

### 14.2 Notification Management

**Viewing Notifications:**
1. Click the **Bell** icon in the navbar or navigate to **Notifications**
2. Unread notifications are highlighted
3. Click a notification to view details and mark as read

**Filtering:**
- **All** - Show all notifications
- **Unread** - Show only unread notifications

**Actions:**
- **Mark as Read** - Click on individual notification
- **Mark All Read** - Bulk action for all unread
- **Delete** - Remove individual notifications
- **Navigate** - Click linked notifications to go to related items

### 14.3 Automatic Notifications

The system automatically generates notifications for:
- Low stock alerts (when material falls below minimum threshold)
- Order status changes (for relevant staff)
- Production batch completion
- New customer inquiries from the catalog
- System maintenance announcements (admin-created)

---

## 15. Online Catalog (Customer-Facing)

### 15.1 Overview

The online catalog is a separate Next.js application that showcases products to customers and enables inquiries and purchases.

### 15.2 Catalog Pages

**Home Page (`/`):**
- Hero section with featured image (hero-2.jpg)
- Brand messaging: "Bespoke Fashion House"
- Featured products showcase (4 columns on xl screens)
- Bespoke experience workflow: Browse --> Fit --> Craft
- Call-to-action buttons

**Collection Page (`/catalog`):**
- All products grid (responsive: 1/2/3/4 columns)
- Sidebar filters (desktop):
  - Search by name/description
  - Collection type: All, Bespoke/Custom, Ready to Wear
  - Category filter
- Mobile filter modal (slides up from bottom, scrollable)
- Sort by: Newest, Price Low-High, Price High-Low
- Product count display
- "Ready to Wear" badge on finished goods (bottom-left of image)

**Product Detail Page (`/product/[id]`):**
- Product image gallery with thumbnails
- Product name, category, price (ZMW)
- Description
- For custom designs: "Enquire About This Design" button (opens inquiry form)
- For finished goods: "Buy Now" button (opens Lenco checkout), stock status
- Estimated production days (custom designs)
- Mobile action bar fixed at bottom with safe area padding
- "Back to Collection" link with safe navbar spacing

**About Page (`/about`):**
- Brand story and heritage (hero-4.jpg)
- Company values and craftsmanship
- Studio and craftsmanship images
- Brand philosophy

### 15.3 Navigation

**Navbar:**
- Logo: "Gloriaz Daughter" (primary brown color)
- Links: Home, Collection, Our Story
- Active link: Primary brown color
- **Book Fitting** button: Opens fitting appointment modal
- Mobile: Hamburger menu with all links

**Footer:**
- Brand name and description
- Quick links
- Contact information (from environment variables)
- Social media links (from environment variables)
- Copyright notice

### 15.4 Catalog Performance

- **Static Generation:** All product pages pre-rendered at build time via `generateStaticParams()`
- **ISR:** Incremental Static Regeneration with 1-hour revalidate cycle
- **Loading States:** Skeleton screens during page transitions
- **Navigation Progress:** Visual progress bar during route changes

### 15.5 Customer Inquiry Flow

1. Customer browses the catalog
2. Clicks "Enquire About This Design" on a product
3. Fills in the inquiry form:
   - Full name, email, phone (required)
   - Preferred size
   - Contact method (WhatsApp, Phone, Email)
   - Custom measurements needed (checkbox)
   - Special requests
4. Submits the form
5. Inquiry is saved to `customer_inquiries` table
6. Notification sent to all ERP staff
7. Staff manages the inquiry in the Enquiries module

### 15.6 Fitting Appointment Booking

1. Customer clicks **Book Fitting** in the navbar
2. A modal opens with the booking form:
   - Full name, email, phone (required)
   - Preferred date (minimum: tomorrow)
   - Preferred time
   - Fitting type (required):
     - Initial Consultation
     - Custom Measurements
     - Design Discussion
     - Fabric Selection
     - Fitting Adjustment
     - Final Fitting
   - Contact method
   - Special requests/notes
3. Submits the form
4. Booking saved as an inquiry
5. Staff contacted notification sent
6. Confirmation message shown to customer

---

## 16. Payment Processing (Lenco)

### 16.1 Overview

The Lenco V2 payment integration enables customers to purchase finished goods (Ready to Wear) directly from the online catalog.

### 16.2 Payment Flow

```
1. Customer clicks "Buy Now" on a finished good
   |
2. Checkout form opens (collects name, email, phone)
   |
3. Customer fills form and clicks "Pay Now"
   |
4. Lenco payment widget launches (card or mobile money)
   |
5. Customer completes payment through Lenco
   |
6. Frontend receives success callback
   |
7. Server-side verification at /api/verify-payment
   |
8. Payment verified with Lenco API
   |
9. Purchase recorded in catalog_purchases table
   |
10. Stock quantity decremented on product
    |
11. Staff notification sent
    |
12. Customer sees success confirmation
```

### 16.3 Checkout Form

The checkout form collects:
- **Customer Name** (required)
- **Customer Email** (required)
- **Customer Phone** (required)
- Order summary with product name and price

### 16.4 Payment Methods

Lenco V2 supports:
- **Card payments** (Visa, Mastercard)
- **Mobile Money** (Zambian mobile networks)

### 16.5 Payment Verification

Server-side verification ensures payment integrity:

1. Frontend sends payment reference to `/api/verify-payment`
2. Server calls Lenco API: `GET /access/v2/collections/status/{reference}`
3. Verifies payment status is "paid"
4. Records purchase in `catalog_purchases` table:
   - Product ID
   - Customer details
   - Amount and currency (ZMW)
   - Lenco reference
   - Payment method
   - Status
5. Decrements `stock_quantity` on the product
6. Creates staff notification for new purchase

### 16.6 Payment Reference Format

```
gd-{productId (first 8 chars)}-{timestamp}
```

Example: `gd-a1b2c3d4-1711234567890`

### 16.7 Purchase Tracking

All purchases are recorded in `catalog_purchases`:
- Viewable by authenticated ERP users
- Linked to products for inventory tracking
- Contains full customer contact information
- Timestamped for financial reporting

---

## 17. User Administration

### 17.1 Overview

User administration is restricted to Admin users only.

**Access:** Admin only

### 17.2 User Operations

**View All Users:**
- Navigate to **Users**
- See list of all system users with:
  - Name
  - Email
  - Role
  - Active/Inactive status

**Create User:**
- See Section 3.3

**Change User Role:**
1. Navigate to **Users**
2. Click on the user
3. Select new role from dropdown
4. Click **Save**
5. The user's access permissions update immediately

**Activate/Deactivate User:**
1. Navigate to **Users**
2. Find the target user
3. Toggle active status
4. Deactivated users cannot log in
5. Reactivation restores access with existing role

---

## 18. Settings & Configuration

### 18.1 Overview

The Settings page manages system-wide configuration.

**Access:** Admin, Manager

### 18.2 Available Settings

**Business Profile:**
- Business name
- Address
- Phone number
- Email
- Logo

**System Appearance:**
- Theme preferences
- Display options

**Financial Settings:**
- Garment type management (also accessible from Finance)
- Overhead cost configuration
- Currency display (fixed: ZMW)

**Workshop Configuration:**
- Operating hours
- Production capacity
- Staff assignments

**Account & Security:**
- Password management
- Session settings

---

## 19. Data Backup & Security

### 19.1 Authentication

- **Provider:** Supabase Auth (email/password)
- **Sessions:** JWT-based with automatic refresh
- **Recovery:** Automatic reconnection on network issues

### 19.2 Row-Level Security (RLS)

Supabase RLS policies enforce data access:
- Users can only access data permitted by their role
- Notification data is scoped to individual users
- Service role key used only server-side for privileged operations (payment processing)

### 19.3 Data Protection

- **Soft Deletes:** Records are marked as deleted, not physically removed
- **Audit Trails:** Inventory transactions and production logs maintain complete history
- **Timestamps:** All records have `created_at` and `updated_at` timestamps
- **UUID Primary Keys:** Non-sequential identifiers for security

### 19.4 Sensitive Data

- **Environment Variables:** API keys, database credentials stored in `.env` files
- **Server-Side Secrets:** Lenco API secret key and Supabase service role key are never exposed to the client
- **Client-Side Keys:** Only public/anon keys are used in the browser

### 19.5 Data Backup

- Supabase provides automatic daily backups
- Database can be exported via Supabase dashboard
- Financial data can be exported to Excel for offline backup

---

## 20. Troubleshooting

### 20.1 Common Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Cannot log in | Wrong credentials | Reset password via admin or Supabase |
| Dashboard not loading | Network issue | Check internet connection, refresh page |
| Stock not deducting | Order not at Production stage | Advance order to "Production" status |
| Notifications not appearing | Browser notifications blocked | Check browser notification settings |
| Catalog products missing | Product set to inactive | Activate the product in Products module |
| Finished goods not showing | Stock quantity is 0 | Restock the product in Products module |
| Payment not processing | Lenco keys not configured | Set `NEXT_PUBLIC_LENCO_PUBLIC_KEY` and `LENCO_API_SECRET_KEY` in environment |
| Enquiry badge not updating | Query cache stale | Badge auto-refreshes every 30 seconds, or refresh page |
| Excel export fails | Large dataset | Try narrowing the date range filter |
| Images not loading | Storage not configured | Check Supabase Storage configuration |

### 20.2 Data Recovery

- **Deleted Records:** Soft-deleted records can be restored by removing the `deleted_at` timestamp
- **Inventory Discrepancies:** Check `inventory_transactions` for audit trail
- **Order History:** Check `order_timeline` for complete status history
- **Production Issues:** Check `production_logs` for detailed action history

### 20.3 Performance Tips

- Use filters to narrow large datasets
- Close unused browser tabs
- Clear browser cache if experiencing stale data
- The system uses real-time subscriptions; ensure stable internet
- Static catalog pages load instantly; dynamic data refreshes via ISR

---

## 21. Environment Setup

### 21.1 ERP Dashboard Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 21.2 Catalog Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Lenco Payment Gateway
NEXT_PUBLIC_LENCO_PUBLIC_KEY=your_lenco_public_key
LENCO_API_SECRET_KEY=your_lenco_api_secret_key

# Business Information (displayed in catalog footer)
NEXT_PUBLIC_BUSINESS_ADDRESS=your_business_address
NEXT_PUBLIC_BUSINESS_PHONE=your_phone_number
NEXT_PUBLIC_BUSINESS_EMAIL=your_email

# Social Media (displayed in catalog footer)
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/your_handle
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/your_page
NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/your_handle
```

### 21.3 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start ERP development server |
| `npm run build` | Build ERP for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build |
| `cd catalog && npm run dev` | Start catalog development server |
| `cd catalog && npm run build` | Build catalog for production |

---

## 22. Database Schema Reference

### 22.1 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user_profiles` | User roles & info | id, full_name, role (admin/manager/employee), active |
| `customers` | Customer data | name, phone, email, measurements (JSONB), address |
| `employees` | Employee records | name, role, email, phone, hire_date, hourly_rate |
| `orders` | Order tracking | order_number (GD-YYYY-XXXX), customer_id, status, total_cost, deposit, balance |
| `order_items` | Items per order | order_id, item_type, quantity, price, measurements |
| `order_materials` | Materials used per order | order_id, material_id, quantity_used, cost |
| `order_timeline` | Order status history | order_id, status, notes, created_at |
| `materials` | Raw material inventory | name, category, unit, stock_quantity, cost_per_unit, min_stock_level, supplier |
| `products` | Product catalog | name, description, category, base_price, labor_cost, product_type, stock_quantity, active |
| `garment_types` | Labor cost reference | name, base_labour_cost, complexity, estimated_hours |
| `production_batches` | Production tracking | batch_number (BATCH-YYYYMM-XXX), product_id, quantity, status, total_cost |
| `production_stages` | Stage tracking | batch_id, stage_name, assigned_to, status, quality_issues |
| `production_materials` | Batch material usage | batch_id, material_id, quantity_used, cost |
| `production_logs` | Production audit trail | batch_id, user_id, action, details, metadata |
| `attendance` | Employee time records | employee_id, date, clock_in, clock_out, hours_worked |
| `inventory_transactions` | Inventory audit trail | material_id, quantity_change, operation_type, order_id |
| `notifications` | System notifications | user_id, type, title, message, read, link |
| `customer_inquiries` | Catalog inquiries | customer_name, customer_phone, customer_email, product_id, status, staff_notes |
| `catalog_purchases` | Online purchases | product_id, customer_name, customer_email, amount, currency, lenco_reference, status |

### 22.2 Key Database Features

- **UUID Primary Keys:** All tables use UUID for secure, non-sequential identifiers
- **Soft Deletes:** `deleted_at` timestamp for recoverable deletion
- **Auto-Generated Numbers:**
  - Orders: `GD-YYYY-XXXX` (e.g., GD-2026-0042)
  - Batches: `BATCH-YYYYMM-XXX` (e.g., BATCH-202603-015)
- **JSONB Fields:** Measurements, metadata, custom attributes
- **RLS Policies:** Row-level security for data isolation
- **Database Triggers:**
  - Auto-update `updated_at` timestamps
  - Auto-generate order numbers
  - Auto-generate batch numbers
  - Notification triggers for new inquiries
- **Views:** `raw_materials`, `finished_products` for simplified queries
- **Indexes:** Performance indexes on frequently queried columns

### 22.3 Order Statuses

```
enquiry --> contacted --> measurement --> cutting --> production --> fitting --> completed --> delivered
```

### 22.4 Production Batch Statuses

```
pending --> in_progress --> completed
```

### 22.5 Production Stage Statuses

```
pending --> in_progress --> completed (or rework)
```

### 22.6 Inquiry Statuses

```
new --> contacted --> converted (or dismissed)
```

---

## Appendix A: Quick Reference - Daily Operations

### Opening Shift

1. Log into ERP Dashboard
2. Check Dashboard for:
   - Low stock alerts
   - Pending orders
   - Today's schedule
3. Check Enquiries for new customer inquiries
4. Clock in employees for the day

### Processing a Customer Walk-In

1. Check if customer exists in Customers module
2. If new: Create customer profile
3. Take measurements and save to profile
4. Create order with customer, garment type, and materials
5. Record deposit payment
6. Confirm timeline with customer

### Processing an Online Inquiry

1. Check Enquiries module (badge shows unread count)
2. Open new inquiry
3. Review customer details and product interest
4. Contact customer via preferred method
5. Mark as "Contacted"
6. Add staff notes about the conversation
7. If ready to proceed: Convert to Order
8. If not viable: Dismiss with reason

### End of Day

1. Clock out all employees
2. Review order statuses and update any progress
3. Check low stock alerts and plan restocking
4. Review production batch progress
5. Export any required reports

### Weekly Tasks

1. Run Analytics for the week
2. Review employee productivity
3. Check inventory levels and plan purchases
4. Export financial summary
5. Review and respond to all pending inquiries

### Monthly Tasks

1. Run full financial analysis
2. Export expense and payment reports
3. Review garment type costing accuracy
4. Update overhead costs if changed
5. Audit inventory against physical stock
6. Review customer analytics and trends

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **RTW** | Ready to Wear - finished goods available for immediate purchase |
| **Bespoke** | Custom-made garments tailored to individual customer measurements |
| **ISR** | Incremental Static Regeneration - Next.js feature for updating static pages |
| **RLS** | Row-Level Security - database-level access control in Supabase |
| **ZMW** | Zambian Kwacha - the currency used throughout the system |
| **Batch** | A production batch containing one or more units of the same product |
| **Stage** | A step in the production process (Cutting, Stitching, Finishing, QC) |
| **Garment Type** | A category of clothing with predefined labor costs and complexity |
| **Overhead** | Business expenses not directly tied to a specific order |
| **Soft Delete** | Marking a record as deleted without physically removing it |
| **Weighted Average** | Cost calculation method when restocking at different prices |
| **Enquiry/Inquiry** | A customer's expression of interest in a product or service |

---

*This SOP is a living document and should be updated as the system evolves. For technical support or feedback, contact the system administrator.*
