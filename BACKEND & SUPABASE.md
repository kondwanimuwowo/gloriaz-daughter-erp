# Backend & Supabase Documentation

Welcome to the **Gloria's Daughter ERP** backend documentation. This guide is designed for junior developers to understand how we interact with Supabase, our data flow patterns, and how to maintain the "backend-less" architecture.

---

## 1. Architectural Overview
This application uses a **Client-Side Backend** architecture. Instead of a traditional Node.js/Python server, we interact directly with **Supabase** using the `@supabase/supabase-js` library.

### Core Components:
- **Database**: PostgreSQL (hosted by Supabase).
- **Authentication**: Supabase Auth (JWT based).
- **Storage**: Supabase Storage (for images/files).
- **Real-time**: Postgres Changes (via WebSockets).

---

## 2. The Supabase Client
The entry point for all database operations is the singleton client.

**File:** `src/lib/supabase.js`

### Key Responsibilities:
- Initializes the connection using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Configures **Auth Persistence** (token storage in `localStorage`).
- Sets up **Real-time Heartbeats** (keeps connection alive).
- **Connection Monitoring**: Dispatches custom events (`supabase-realtime-status`) so the UI can show the "LIVE" status badge.

> [!IMPORTANT]
> Always import `supabase` from this file. Never create a second instance using `createClient` elsewhere.

---

## 3. The Service Layer Pattern
We do not write raw Supabase queries directly inside React components. Instead, we use a **Service Layer** located in `src/services/`.

### Example: `orderService.js`
All orders-related logic is encapsulated here:
```javascript
// Pattern for fetching data with relations
async getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name, phone)') // Automatic Join
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### Why use this pattern?
1. **Abstraction**: If we change a table name, we only change it in one file.
2. **Reusability**: The same query can be used by multiple components.
3. **Clean Components**: React files stay focused on UI/state, not data fetching logic.

---

## 4. Authentication Flow
Authentication is managed globally via **Zustand**.

**Files:**
- `src/store/useAuthStore.js`: Global state for `user`, `profile`, and `session`.
- `src/services/authService.js`: Raw Supabase Auth calls (Sign In, Sign Out).

### Flow:
1. `App.jsx` calls `authStore.initialize()`.
2. It retrieves the current session from local storage.
3. If valid, it fetches the user's `profile` from the custom `profiles` table.
4. `ProtectedRoute.jsx` checks the store to allow or block access to pages.

---

## 5. Real-time Data Sync & Stability
Because this is an ERP, data must be fresh. We have a robust sync mechanism to prevent "stale" tables.

### `useConnectionSync.js`
This hook is our "Watchdog". It increments a `syncVersion` whenever:
- The user comes back to the tab (**Visibility Change**).
- The network recovers (**Online Event**).
- The Supabase connection is re-established.

**Usage in Pages:**
```javascript
useEffect(() => {
    fetchData();
}, [syncVersion]); // Re-runs whenever the connection resets
```

---

## 6. Files Connected to Supabase

| Path | Purpose |
| :--- | :--- |
| `src/lib/supabase.js` | **Primary Client Config** (Heart & Soul) |
| `src/services/authService.js` | User login/registration/recovery |
| `src/services/orderService.js` | Order CRUD and Status updates |
| `src/services/inventoryService.js` | Materials, Stock, and Categories |
| `src/services/customerService.js` | CRM data management |
| `src/services/employeeService.js` | Staff data and Attendance |
| `src/services/financeService.js` | Revenue, Expenses, and Payments |
| `src/services/analyticsService.js` | Complex Business Intelligence queries |
| `src/services/notificationService.js` | In-app alerts and real-time triggers |
| `src/store/useAuthStore.js` | Reactive Auth State |
| `src/hooks/useConnectionSync.js` | Real-time monitoring logic |
| `src/components/layout/Navbar.jsx` | Global Search & Connection Status UI |

---

## 7. Junior Developer Tips

### Error Handling
Supabase returns objects in the format `{ data, error }`. **Never** assume `data` exists without checking `error` first.
```javascript
const { data, error } = await supabase...;
if (error) {
  console.error(error.message);
  return;
}
```

### Relational Data
To get data from another table (Join), use the related table name in the `.select()`:
- `supabase.from('orders').select('*, customers(*)')` -> Gets the order AND the full customer object for that order.

### Using `.single()` and `.maybeSingle()`
- Use `.single()` if you expect exactly ONE row (e.g., fetching by ID). It will error if 0 or 2+ rows are found.
- Use `.maybeSingle()` if it might not exist (e.g., checking if a user profile is created yet).

---

## Need Help?
If the database isn't updating, check the **Network** tab in Chrome DevTools. Look for calls to `rest/v1` or `realtime/v1`.
