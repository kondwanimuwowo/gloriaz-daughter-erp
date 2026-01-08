-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  employee_id uuid,
  date date NOT NULL,
  clock_in timestamp without time zone,
  clock_out timestamp without time zone,
  hours_worked numeric,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.customer_inquiries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  customer_name character varying NOT NULL,
  customer_phone character varying NOT NULL,
  customer_email character varying,
  preferred_size character varying,
  custom_measurements_needed boolean DEFAULT false,
  special_requests text,
  contact_method character varying DEFAULT 'whatsapp'::character varying,
  status character varying DEFAULT 'new'::character varying,
  staff_notes text,
  converted_order_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  contacted_at timestamp without time zone,
  CONSTRAINT customer_inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT customer_inquiries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT customer_inquiries_converted_order_id_fkey FOREIGN KEY (converted_order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  phone character varying NOT NULL,
  email character varying,
  address text,
  measurements jsonb,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  role character varying NOT NULL,
  email character varying UNIQUE,
  phone character varying NOT NULL,
  hire_date date NOT NULL,
  hourly_rate numeric,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  payment_method text,
  reference_number text,
  employee_id uuid,
  order_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT expenses_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.financial_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  custom_hourly_rate numeric DEFAULT 25.00,
  default_profit_margin numeric DEFAULT 40.00,
  expected_monthly_orders integer DEFAULT 40,
  tax_rate numeric DEFAULT 0.00,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT financial_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.garment_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  base_labour_cost numeric NOT NULL DEFAULT 0,
  estimated_hours numeric DEFAULT 0,
  complexity character varying DEFAULT 'standard'::character varying,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT garment_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  material_id uuid,
  quantity_change numeric NOT NULL,
  operation_type character varying NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  order_id uuid,
  unit_cost numeric,
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_transactions_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id),
  CONSTRAINT inventory_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  category character varying NOT NULL,
  unit character varying NOT NULL,
  stock_quantity numeric NOT NULL DEFAULT 0,
  min_stock_level numeric NOT NULL DEFAULT 0,
  cost_per_unit numeric NOT NULL,
  supplier character varying,
  description text,
  last_restocked timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  material_type character varying DEFAULT 'raw_material'::character varying CHECK (material_type::text = ANY (ARRAY['raw_material'::character varying, 'finished_product'::character varying]::text[])),
  finished_product_sku character varying,
  selling_price numeric,
  production_cost numeric,
  product_id uuid,
  reorder_level integer DEFAULT 5,
  CONSTRAINT materials_pkey PRIMARY KEY (id),
  CONSTRAINT materials_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['low_stock'::text, 'order_update'::text, 'production_complete'::text, 'system'::text])),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  item_type character varying NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  price numeric NOT NULL,
  measurements jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  material_id uuid,
  quantity_used numeric NOT NULL,
  cost numeric NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_materials_pkey PRIMARY KEY (id),
  CONSTRAINT order_materials_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);
CREATE TABLE public.order_timeline (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  status character varying NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_timeline_pkey PRIMARY KEY (id),
  CONSTRAINT order_timeline_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number character varying NOT NULL UNIQUE,
  customer_id uuid,
  status character varying NOT NULL DEFAULT 'enquiry'::character varying,
  order_date timestamp without time zone DEFAULT now(),
  due_date timestamp without time zone,
  total_cost numeric NOT NULL DEFAULT 0,
  deposit numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  description text,
  notes text,
  assigned_tailor_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  labour_cost numeric DEFAULT 0,
  overhead_cost numeric DEFAULT 0,
  material_cost numeric DEFAULT 0,
  profit_margin numeric DEFAULT 0,
  garment_type_id uuid,
  order_type character varying DEFAULT 'custom'::character varying,
  product_id uuid,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_assigned_tailor_id_fkey FOREIGN KEY (assigned_tailor_id) REFERENCES public.employees(id),
  CONSTRAINT orders_garment_type_id_fkey FOREIGN KEY (garment_type_id) REFERENCES public.garment_types(id),
  CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.overhead_costs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  month date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  is_recurring boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT overhead_costs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  payment_method text NOT NULL,
  reference_number text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.production_batches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_number character varying NOT NULL UNIQUE,
  product_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  status character varying DEFAULT 'cutting'::character varying CHECK (status::text = ANY (ARRAY['cutting'::character varying, 'stitching'::character varying, 'finishing'::character varying, 'quality_check'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  total_cost numeric DEFAULT 0,
  labor_cost numeric DEFAULT 0,
  material_cost numeric DEFAULT 0,
  CONSTRAINT production_batches_pkey PRIMARY KEY (id),
  CONSTRAINT production_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.production_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid,
  user_id uuid,
  action text NOT NULL,
  details text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT production_logs_pkey PRIMARY KEY (id),
  CONSTRAINT production_logs_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.production_batches(id),
  CONSTRAINT production_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.production_materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid,
  material_id uuid,
  quantity_used numeric NOT NULL,
  cost numeric NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT production_materials_pkey PRIMARY KEY (id),
  CONSTRAINT production_materials_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.production_batches(id),
  CONSTRAINT production_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);
CREATE TABLE public.production_stages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_id uuid,
  stage_name character varying NOT NULL CHECK (stage_name::text = ANY (ARRAY['cutting'::character varying, 'stitching'::character varying, 'finishing'::character varying, 'quality_check'::character varying]::text[])),
  assigned_to uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'rework'::character varying]::text[])),
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  notes text,
  quality_issues text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  input_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT production_stages_pkey PRIMARY KEY (id),
  CONSTRAINT production_stages_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.production_batches(id),
  CONSTRAINT production_stages_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  category character varying,
  image_url text,
  estimated_days integer DEFAULT 7,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  featured boolean DEFAULT false,
  stock_status character varying DEFAULT 'in_stock'::character varying,
  customizable boolean DEFAULT false,
  gallery_images ARRAY,
  size_guide text,
  fabric_details text,
  care_instructions text,
  updated_at timestamp without time zone DEFAULT now(),
  labor_cost numeric DEFAULT 0,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email character varying NOT NULL,
  full_name character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'employee'::character varying,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);