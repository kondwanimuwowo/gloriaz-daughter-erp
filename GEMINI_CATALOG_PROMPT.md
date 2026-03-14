# Gemini Prompt: Gloria's Daughter — Customer-Facing Catalog

## Objective

Build a professional, visually stunning customer-facing product catalog web application for **"Gloria's Daughter"** — a premium fashion and tailoring brand. This is a **separate** React application that connects to the **same Supabase backend** as the existing ERP system. The catalog is fully public (no customer authentication required).

---

## Design System

The catalog must match the existing ERP's design system and feel premium, elegant, and luxurious.

### Colors (HSL values — use these exactly)

| Token                  | HSL Value            | Usage                                    |
| ---------------------- | -------------------- | ---------------------------------------- |
| `--primary`            | `46 70% 40%`        | Gold — buttons, accents, highlights      |
| `--primary-foreground` | `0 0% 100%`         | Text on primary backgrounds              |
| `--background`         | `0 0% 100%`         | Page background (white)                  |
| `--foreground`         | `240 10% 3.9%`      | Main text color (dark slate)             |
| `--secondary`          | `240 4.8% 95.9%`    | Secondary backgrounds                    |
| `--secondary-foreground` | `240 5.9% 10%`    | Text on secondary backgrounds            |
| `--muted`              | `240 4.8% 95.9%`    | Muted backgrounds (card sections)        |
| `--muted-foreground`   | `240 3.8% 46.1%`    | Subtle/secondary text                    |
| `--accent`             | `240 4.8% 95.9%`    | Accent backgrounds                       |
| `--accent-foreground`  | `240 5.9% 10%`      | Text on accent backgrounds               |
| `--destructive`        | `0 84.2% 60.2%`     | Error/destructive actions (red)          |
| `--destructive-foreground` | `0 0% 98%`      | Text on destructive backgrounds          |
| `--border`             | `240 5.9% 90%`      | Borders                                  |
| `--input`              | `240 5.9% 90%`      | Input field borders                      |
| `--ring`               | `46 70% 40%`        | Focus ring (matches primary gold)        |
| `--radius`             | `0.5rem`             | Base border radius                       |

### Typography

- Use **Inter** as the primary font (import from Google Fonts). The ERP uses system fonts, but the catalog should feel more polished with Inter.
- Fallback: system sans-serif stack.

### Visual Style

- Luxury fashion aesthetic — clean whites, gold accents, generous whitespace.
- Glassmorphism for modals and overlays.
- Smooth hover transitions (scale, shadow, opacity).
- High-quality image presentation — large hero images, clean grid layouts.
- Subtle Framer Motion animations (fade-in, slide-up on scroll, staggered card reveals).

---

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | React (Vite)                        |
| Routing     | `react-router-dom`                  |
| Styling     | Tailwind CSS v4                     |
| Backend     | Supabase (`@supabase/supabase-js`)  |
| Icons       | Lucide React                        |
| Animations  | Framer Motion                       |
| Utilities   | `clsx`, `tailwind-merge`            |

---

## Supabase Configuration

### Environment Variables

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Client Setup

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

This is a simple public client — no auth, no session persistence needed.

---

## Database Schema (Exact Column Names)

### `products` table — READ ONLY

Pull designs for the catalog. Filter: `active = true AND deleted_at IS NULL`.

| Column               | Type         | Notes                                      |
| -------------------- | ------------ | ------------------------------------------ |
| `id`                 | UUID (PK)    |                                            |
| `name`               | VARCHAR      | Product name                               |
| `description`        | TEXT         | Full description                           |
| `base_price`         | NUMERIC      | Display price                              |
| `category`           | VARCHAR      | Category string (e.g., "Dresses", "Suits") |
| `image_url`          | TEXT         | Primary image URL                          |
| `gallery_images`     | TEXT[]       | Array of additional image URLs             |
| `estimated_days`     | INTEGER      | Estimated production time in days          |
| `featured`           | BOOLEAN      | Use for "Featured Designs" section         |
| `customizable`       | BOOLEAN      | If true, show "Enquire Now" button         |
| `stock_status`       | VARCHAR      | `'in_stock'`, `'low_stock'`, `'out_of_stock'` |
| `size_guide`         | TEXT         | Size information                           |
| `fabric_details`     | TEXT         | Fabric/material info                       |
| `care_instructions`  | TEXT         | Care info                                  |
| `created_at`         | TIMESTAMP    |                                            |

**Note:** Categories are stored as strings directly on the `products` table (there is no separate categories table). To build the category filter, query `SELECT DISTINCT category FROM products WHERE active = true AND deleted_at IS NULL`.

### `materials` table — READ ONLY (Finished Goods)

Pull ready-to-wear/buy items. Filter: `material_type = 'finished_product' AND deleted_at IS NULL`.

| Column                | Type         | Notes                                    |
| --------------------- | ------------ | ---------------------------------------- |
| `id`                  | UUID (PK)    |                                          |
| `name`                | VARCHAR      | Product name                             |
| `category`            | VARCHAR      | Category string                          |
| `description`         | TEXT         | Product description                      |
| `selling_price`       | NUMERIC      | Customer-facing price                    |
| `stock_quantity`      | NUMERIC      | Available stock (show availability)      |
| `finished_product_sku`| VARCHAR      | SKU reference                            |
| `product_id`          | UUID (FK)    | Links to `products` table for images/details |

**Important:** Finished goods in `materials` link to `products` via `product_id`. Use the linked product's `image_url` and `gallery_images` for display.

### `customer_inquiries` table — INSERT ONLY

When a customer submits an inquiry for a custom design.

| Column                      | Type      | Notes                                  |
| --------------------------- | --------- | -------------------------------------- |
| `product_id`                | UUID (FK) | The product they're inquiring about    |
| `customer_name`             | VARCHAR   | Required                               |
| `customer_phone`            | VARCHAR   | Required                               |
| `customer_email`            | VARCHAR   | Required                               |
| `preferred_size`            | VARCHAR   | Optional — size preference             |
| `custom_measurements_needed`| BOOLEAN   | Default `false` — can they come in for measurements? |
| `special_requests`          | TEXT      | Optional — additional notes            |
| `contact_method`            | VARCHAR   | Default `'whatsapp'` — preferred contact method |
| `status`                    | VARCHAR   | Always set to `'new'` on insert        |

### `notifications` table — INSERT via Database Trigger (NOT from client)

The `notifications` table requires a `user_id` (FK to `auth.users`) which the public catalog does not have. **Do NOT insert into this table from the catalog app.** Instead, generate a **Supabase database trigger** (see SQL section below) that automatically creates notifications for all admin users when a new inquiry is inserted.

---

## Required SQL (RLS Policies & Trigger)

Generate the following SQL migration that must be run on the Supabase database to enable the catalog:

```sql
-- ============================================
-- RLS Policies for Public Catalog Access
-- ============================================

-- Allow anonymous/public READ on products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon
  USING (active = true AND deleted_at IS NULL);

-- Allow anonymous/public READ on materials (finished goods only)
CREATE POLICY "Public can view finished products"
  ON materials FOR SELECT
  TO anon
  USING (material_type = 'finished_product' AND deleted_at IS NULL);

-- Allow anonymous/public INSERT on customer_inquiries
CREATE POLICY "Public can submit inquiries"
  ON customer_inquiries FOR INSERT
  TO anon
  WITH CHECK (status = 'new');

-- ============================================
-- Trigger: Auto-create notifications on new inquiry
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
  product_name TEXT;
BEGIN
  -- Get product name
  SELECT name INTO product_name FROM products WHERE id = NEW.product_id;

  -- Create notification for all admin and manager users
  FOR admin_user IN
    SELECT id FROM user_profiles WHERE role IN ('admin', 'manager')
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, read)
    VALUES (
      admin_user.id,
      'order_update',
      'New Customer Inquiry',
      'New inquiry from ' || NEW.customer_name || ' for ' || COALESCE(product_name, 'a product'),
      '/inquiries',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_inquiry
  AFTER INSERT ON customer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_inquiry();
```

**Include this SQL block in your output** so the user can run it as a Supabase migration.

---

## Pages & Features

### 1. Home Page (`/`)

- **Hero Section:** Full-width image/video background with brand name "Gloria's Daughter", tagline (e.g., "Bespoke Fashion, Crafted for You"), and two CTAs: "Browse Collection" and "Request Custom Design".
- **Featured Designs:** Horizontal scroll or grid of products where `featured = true`. Show image, name, price.
- **How It Works:** 3-step visual (Browse → Enquire → Get Fitted).
- **Testimonials Section:** Placeholder for future testimonials.
- **Footer:** Brand info, contact details, social links (placeholders).

### 2. Catalog Page (`/catalog`)

- **Category Filter:** Pull distinct categories from `products.category`. Include an "All" option and a "Ready to Wear" filter that shows finished goods from `materials`.
- **Search Bar:** Filter by product name.
- **Product Grid:** Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop).
  - Each card shows: image, name, price, category badge.
  - **Custom Design items** (from `products`): Show "Enquire Now" button.
  - **Ready to Wear items** (from `materials`): Show "Buy Now" button and stock status badge (In Stock / Low Stock / Out of Stock).
- **Sort:** By price (low-high, high-low), newest first.

### 3. Product Detail Page (`/product/:id`)

- **Image Gallery:** Large main image with thumbnail strip from `gallery_images`. Click to expand/zoom.
- **Product Info:** Name, price, description, fabric details, care instructions, size guide, estimated production days (for custom items).
- **Action Button:**
  - Custom designs → "Enquire About This Design" → opens inquiry modal.
  - Finished goods → "Buy Now" → shows stock availability and a placeholder checkout message (e.g., "Contact us on WhatsApp to complete your purchase" with a WhatsApp link).

### 4. Inquiry Modal (Overlay)

A sleek modal/slide-over form triggered from product detail or catalog card:

- Fields:
  - Full Name (required)
  - Phone Number (required)
  - Email (required)
  - Preferred Size (optional — dropdown: XS, S, M, L, XL, XXL, Custom)
  - Need Custom Measurements? (toggle/checkbox)
  - Preferred Contact Method (radio: WhatsApp, Phone Call, Email — default WhatsApp)
  - Special Requests / Notes (textarea, optional)
- On submit: INSERT into `customer_inquiries` with `status = 'new'`.
- Show success confirmation with animation.
- Show error state if submission fails.

### 5. About Page (`/about`) — Optional

Simple brand story page with placeholder content.

---

## Service Layer

Create `src/services/catalogService.js` with these functions:

```javascript
// Fetch all active products (custom designs)
export async function getProducts(category = null)

// Fetch featured products
export async function getFeaturedProducts()

// Fetch single product by ID
export async function getProductById(id)

// Fetch distinct categories
export async function getCategories()

// Fetch finished goods (ready to wear)
export async function getFinishedGoods(category = null)

// Fetch single finished good by ID
export async function getFinishedGoodById(id)

// Submit customer inquiry
export async function submitInquiry(inquiryData)
```

---

## Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── home/
│   │   ├── HeroSection.jsx
│   │   ├── FeaturedDesigns.jsx
│   │   └── HowItWorks.jsx
│   ├── catalog/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── CategoryFilter.jsx
│   │   └── SearchBar.jsx
│   └── inquiry/
│       └── InquiryForm.jsx
├── pages/
│   ├── Home.jsx
│   ├── Catalog.jsx
│   └── ProductDetail.jsx
├── services/
│   └── catalogService.js
├── lib/
│   ├── supabase.js
│   └── utils.js          (cn() helper using clsx + tailwind-merge)
├── App.jsx
├── main.jsx
└── index.css
```

---

## Responsive Design

- **Mobile-first** approach.
- Hamburger menu on mobile navbar.
- Product grid: 1 column on mobile, 2 on tablet, 3-4 on desktop.
- Touch-friendly tap targets (min 44px).
- Image gallery should be swipeable on mobile.

---

## Performance Considerations

- Lazy load images.
- Use `loading="lazy"` on images below the fold.
- Keep bundle size small — only import what's needed from Lucide (tree-shakeable).
- Use Supabase's built-in image transforms for thumbnails if images are stored in Supabase Storage (append `?width=400` to storage URLs).

---

## GEMINI INSTRUCTIONS

Please generate the **complete, production-ready code** for this application. Specifically:

1. `package.json` with all dependencies.
2. Vite config.
3. `index.css` with the complete CSS custom properties (color tokens) and Tailwind directives.
4. Supabase client setup.
5. The SQL migration file for RLS policies and the notification trigger.
6. All pages, components, and the service layer.
7. `App.jsx` with routing.
8. `main.jsx` entry point.

Provide the code in a clear, file-by-file format that I can copy and paste directly. Make sure every component is complete — no placeholders like `// TODO` or `{/* Add content here */}`. Use real placeholder images from `https://placehold.co` for any images.
