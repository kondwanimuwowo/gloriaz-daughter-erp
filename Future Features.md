# Future Features & Roadmap

This document outlines the planned future features, enhancements, and smart capabilities for the Gloriaz Daughter ERP system. These items are categorized by priority and implementation phase.

## 🚀 Priority 1: Post-Road Test Enhancements
*Essential features to implement immediately after the initial road test feedback.*

### 1. Inventory-Production Integration (Deferred Item)
**Context**: Currently, production batches do not automatically deduct raw materials from inventory.
**Feature**: 
- strict link between `production_batches` and `inventory_items`.
- **Material Selection UI**: During batch creation, select specific inventory lots (fabrics, thread, buttons).
- **Auto-Deduction**: Validating stock levels before starting production and deducting upon batch creation.
- **Wastage Tracking**: Ability to record wasted material during "Cutting" or "Quality Check" stages.

### 2. Batch Editing Capabilities
**Context**: Users currently cannot edit a batch once created (e.g., to correct a mistake).
**Feature**:
- **Edit Modal**: Allow editing of batch quantity, assigned tailor, or notes.
- **Audit Trail**: Log who made changes and when.
- **Status Rollback**: Ability to move a batch backward in stages (e.g., from "QA" back to "Stitching" for repairs).

### 3. Notification Preferences
**Context**: Users receive all notifications, which may become noisy.
**Feature**:
- **User Settings**: Toggle specific notification types (e.g., "Notify me only on Completed batches", "Mute Low Stock alerts").
- **Channel Selection**: Choose between In-App, Email, or SMS notifications (future expansion).

### 4. Production Analytics
**Context**: No visual insights into production efficiency.
**Feature**:
- **Cycle Time Dashboard**: Visual graph showing average days to complete batches.
- **Stage Bottlenecks**: Identify which stage (Cutting, Stitching, etc.) takes the longest.
- **Tailor Performance**: Metrics on quantity produced vs. defects per tailor.

---

## 🧠 Priority 2: Smart App Features (AI & Data Driven)
*Advanced features to make the application "intelligent" and world-class.*

### 1. Predictive Material Ordering
**Description**: Algorithm to analyze usage patterns and predict when stock will run out.
**Capabilities**:
- "You will run out of 'Blue Silk' in 14 days based on current production rates."
- Suggested reorder quantities based on lead time and usage velocity.

### 2. Smart Deadline Alerts
**Description**: Intelligent warning system during order creation.
**Capabilities**:
- "Warning: The selected due date (Friday) is risky. Current production queue is 90% full."
- Suggest realistic delivery dates based on current workload and employee availability.

### 3. Dynamic Pricing Optimization
**Description**: Real-time pricing suggestions based on varying costs.
**Capabilities**:
- Auto-calculate recommended selling price if raw material costs increase.
- "Profit Margin Alert": Warn if a custom order's price yields less than target margin (e.g., < 20%).

### 4. Customer Pattern Recognition
**Description**: Personalized experience for returning customers.
**Capabilities**:
- "Welcome back, Mrs. Banda. Usually orders 'Chitenge Dresses' size M."
- auto-fill preference fields for returning clients.

---

## 🛠 Priority 3: Operational & Financial Features
*Features to deepen the business management capabilities.*

### 1. Cost Variance Tracking
**Description**: Compare *Estimated* costs vs. *Actual* costs.
**Value**: Identify where money is leaking (e.g., consistently underestimating labour hours).

### 2. Payment & Debt Management
**Description**: Automated debt collection helpers.
**Capabilities**:
- **Auto-Reminders**: Send WhatsApp/SMS reminders for overdue deposits.
- **Payment Link Generation**: Generate payment links for orders (integration with payment gateways).

### 3. Batch Optimization
**Description**: Grouping similar orders to maximize efficiency.
**Capabilities**:
- "Suggestion: You have 3 pending orders for 'School Uniforms'. Create a single production batch of 50 to save cutting time."

### 4. Multi-Branch Support (Scalability)
**Description**: Managing multiple shop locations.
**Capabilities**:
- Separate inventory per location.
- Transfer stock between branches.
- Centralized Admin view vs. Branch Manager view.

---

## 📱 Priority 4: User Experience (UX) Polish

### 1. Offline Mode (PWA)
- Enable basic functionality (viewing orders, checking stock) without internet.
- Sync changes when connection is restored.

### 2. Mobile Scanner Integration
- Use phone camera to scan QR codes on physical Batch Cards or Inventory Bins to instantly open details in the app.

### 3. Dark/Light Mode Refinement
- Ensure perfect contrast and accessibility across all new screens.
- User-selectable themes beyond system default.

