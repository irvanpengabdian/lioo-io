

--- Content of lioo.io Database Design.docx ---


lioo.io - Database Schema Design

PostgreSQL Multi-Tenant Architecture dengan ORM Support



1. Arsitektur Multi-Tenancy

lioo.io menggunakan Schema-per-Tenant approach untuk isolasi data yang kuat sambil memudahkan maintenance.

plainCopy

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé                    PostgreSQL Server                    Γöé

Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ   Γöé

Γöé  Γöé   public    Γöé  Γöé  tenant_1   Γöé  Γöé  tenant_2   Γöé   Γöé

Γöé  Γöé  (shared)   Γöé  Γöé (merchant_A)Γöé  Γöé (merchant_B)Γöé   Γöé

Γöé  Γöé             Γöé  Γöé             Γöé  Γöé             Γöé   Γöé

Γöé  Γöé ΓÇó tenants   Γöé  Γöé ΓÇó users     Γöé  Γöé ΓÇó users     Γöé   Γöé

Γöé  Γöé ΓÇó plans     Γöé  Γöé ΓÇó products  Γöé  Γöé ΓÇó products  Γöé   Γöé

Γöé  Γöé ΓÇó cms_      Γöé  Γöé ΓÇó orders    Γöé  Γöé ΓÇó orders    Γöé   Γöé

Γöé  Γöé   content   Γöé  Γöé ΓÇó inventory Γöé  Γöé ΓÇó inventory Γöé   Γöé

Γöé  Γöé ΓÇó system_   Γöé  Γöé ΓÇó finance   Γöé  Γöé ΓÇó finance   Γöé   Γöé

Γöé  Γöé   configs   Γöé  Γöé ΓÇó ...       Γöé  Γöé ΓÇó ...       Γöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ   Γöé

Γöé                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ   Γöé

Γöé  Γöé  tenant_3   Γöé  Γöé  tenant_n   Γöé  Γöé   ...       Γöé   Γöé

Γöé  Γöé (merchant_C)Γöé  Γöé             Γöé  Γöé             Γöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ   Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ



2. Schema Public (Shared Resources)

2.1 Tabel Tenants (Master Registry)

sqlCopy

-- ============================================

-- SCHEMA: public

-- TABEL: tenants

-- DESKRIPSI: Master registry untuk semua merchant

-- ============================================



CREATE TABLE public.tenants (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Informasi Dasar

    name                VARCHAR(255) NOT NULL,

    slug                VARCHAR(100) UNIQUE NOT NULL, -- untuk subdomain

    schema_name         VARCHAR(100) UNIQUE NOT NULL, -- nama schema: tenant_{slug}

    

    -- Status & Tipe

    status              VARCHAR(20) DEFAULT 'active' 

                        CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),

    plan_id             UUID REFERENCES public.plans(id),

    

    -- Domain & Branding

    custom_domain       VARCHAR(255) UNIQUE,

    logo_url            TEXT,

    favicon_url         TEXT,

    primary_color       VARCHAR(7) DEFAULT '#7C8B6F',

    secondary_color     VARCHAR(7) DEFAULT '#F5F5F0',

    

    -- Kontak & Lokasi

    email               VARCHAR(255) NOT NULL,

    phone               VARCHAR(20),

    address             TEXT,

    city                VARCHAR(100),

    province            VARCHAR(100),

    postal_code         VARCHAR(10),

    country             VARCHAR(2) DEFAULT 'ID',

    

    -- Pengaturan Bisnis

    business_type       VARCHAR(50) CHECK (business_type IN ('coffee_shop', 'restaurant', 'cafe', 'bakery', 'food_truck', 'other')),

    tax_id              VARCHAR(50), -- NPWP

    currency            VARCHAR(3) DEFAULT 'IDR',

    timezone            VARCHAR(50) DEFAULT 'Asia/Jakarta',

    

    -- Subscription & Billing

    subscription_status VARCHAR(20) DEFAULT 'trial',

    trial_ends_at       TIMESTAMP WITH TIME ZONE,

    current_period_start TIMESTAMP WITH TIME ZONE,

    current_period_end   TIMESTAMP WITH TIME ZONE,

    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    

    -- Flex Plan Wallet (untuk pay-per-transaction)

    wallet_balance      DECIMAL(15,2) DEFAULT 0.00,

    wallet_currency     VARCHAR(3) DEFAULT 'IDR',

    low_balance_threshold DECIMAL(15,2) DEFAULT 50000.00,

    

    -- Metadata

    settings            JSONB DEFAULT '{}', -- flexible config

    features_enabled    JSONB DEFAULT '[]', -- array of enabled feature flags

    

    -- Audit

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_by          UUID,

    deleted_at          TIMESTAMP WITH TIME ZONE, -- soft delete

    

    -- Constraints

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

);



-- Indexes

CREATE INDEX idx_tenants_status ON public.tenants(status);

CREATE INDEX idx_tenants_plan ON public.tenants(plan_id);

CREATE INDEX idx_tenants_schema ON public.tenants(schema_name);

CREATE INDEX idx_tenants_domain ON public.tenants(custom_domain) WHERE custom_domain IS NOT NULL;

CREATE INDEX idx_tenants_wallet ON public.tenants(wallet_balance) WHERE plan_id = 'flex_plan_uuid';



-- Trigger untuk auto-create schema saat tenant dibuat

CREATE OR REPLACE FUNCTION public.create_tenant_schema()

RETURNS TRIGGER AS $$

BEGIN

    -- Create new schema

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', NEW.schema_name);

    

    -- Grant privileges

    EXECUTE format('GRANT ALL ON SCHEMA %I TO CURRENT_USER', NEW.schema_name);

    

    -- Set search path untuk session ini

    EXECUTE format('SET search_path TO %I, public', NEW.schema_name);

    

    -- Run tenant schema initialization (akan dijelaskan di bagian 3)

    -- Ini bisa di-trigger via application layer atau menggunakan pg_cron

    

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_create_tenant_schema

    AFTER INSERT ON public.tenants

    FOR EACH ROW

    EXECUTE FUNCTION public.create_tenant_schema();

2.2 Tabel Plans (Subscription Tiers)

sqlCopy

-- ============================================

-- TABEL: plans

-- DESKRIPSI: Master data subscription tiers

-- ============================================



CREATE TABLE public.plans (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Informasi Plan

    code                VARCHAR(20) UNIQUE NOT NULL, -- 'starter', 'flex', 'regular'

    name                VARCHAR(100) NOT NULL, -- "Starter", "Flex", "Regular"

    description         TEXT,

    

    -- Tipe Billing

    billing_type        VARCHAR(20) CHECK (billing_type IN ('free', 'per_transaction', 'monthly', 'yearly')),

    

    -- Harga

    base_price          DECIMAL(15,2), -- untuk monthly/yearly

    transaction_fee     DECIMAL(15,2), -- untuk per_transaction (e.g., 200.00)

    currency            VARCHAR(3) DEFAULT 'IDR',

    

    -- Limit & Quota

    max_users           INTEGER,

    max_products        INTEGER,

    max_locations       INTEGER DEFAULT 1,

    max_transactions_per_month INTEGER, -- NULL = unlimited

    

    -- Features (JSONB untuk flexibility)

    features            JSONB DEFAULT '{

        "cashier_terminal": true,

        "basic_dashboard": true,

        "customer_ordering": false,

        "kitchen_display": false,

        "inventory_basic": false,

        "inventory_advanced": false,

        "finance_module": false,

        "api_access": false,

        "custom_branding": false,

        "multi_location": false,

        "priority_support": false

    }',

    

    -- Display

    is_popular          BOOLEAN DEFAULT FALSE, -- untuk badge "Paling Favorit"

    sort_order          INTEGER DEFAULT 0,

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    is_public           BOOLEAN DEFAULT TRUE, -- tampilkan di landing page?

    

    -- Metadata

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- Seed data

INSERT INTO public.plans (code, name, billing_type, base_price, transaction_fee, max_products, features) VALUES

('starter', 'Starter', 'free', 0, NULL, 5, 

 '{"cashier_terminal": true, "basic_dashboard": true, "customer_ordering": false, "custom_branding": false}'),

 

('flex', 'Flex', 'per_transaction', NULL, 200.00, NULL, 

 '{"cashier_terminal": true, "advanced_dashboard": true, "customer_ordering": true, "kitchen_display": true, "api_access": true}'),



('regular', 'Regular', 'monthly', 899000.00, NULL, NULL, 

 '{"cashier_terminal": true, "advanced_dashboard": true, "customer_ordering": true, "kitchen_display": true, 

   "inventory_advanced": true, "custom_branding": true, "multi_location": true, "priority_support": true}');

2.3 Tabel System Users (Super Admin)

sqlCopy

-- ============================================

-- TABEL: system_users

-- DESKRIPSI: Admin internal lioo.io (bukan merchant users)

-- ============================================



CREATE TABLE public.system_users (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Profile

    email               VARCHAR(255) UNIQUE NOT NULL,

    password_hash       VARCHAR(255) NOT NULL,

    full_name           VARCHAR(255) NOT NULL,

    avatar_url          TEXT,

    

    -- Role

    role                VARCHAR(20) DEFAULT 'support' 

                        CHECK (role IN ('super_admin', 'admin', 'support', 'finance', 'developer')),

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    email_verified      BOOLEAN DEFAULT FALSE,

    last_login_at       TIMESTAMP WITH TIME ZONE,

    

    -- Security

    mfa_enabled         BOOLEAN DEFAULT FALSE,

    mfa_secret          VARCHAR(255),

    failed_login_attempts INTEGER DEFAULT 0,

    locked_until        TIMESTAMP WITH TIME ZONE,

    

    -- Audit

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_by          UUID REFERENCES public.system_users(id)

);



-- CMS Content Tables

CREATE TABLE public.cms_pages (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug                VARCHAR(100) UNIQUE NOT NULL,

    title               VARCHAR(255) NOT NULL,

    content             JSONB, -- structured content blocks

    meta_description    TEXT,

    is_published        BOOLEAN DEFAULT FALSE,

    published_at        TIMESTAMP WITH TIME ZONE,

    created_by          UUID REFERENCES public.system_users(id),

    updated_by          UUID REFERENCES public.system_users(id),

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE public.cms_pricing_display (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    plan_id             UUID REFERENCES public.plans(id),

    display_title       VARCHAR(100),

    display_description TEXT,

    feature_highlights  JSONB, -- array of strings untuk checkmarks

    cta_text            VARCHAR(50) DEFAULT 'Pilih Paket',

    sort_order          INTEGER,

    is_active           BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



3. Schema Tenant (Per Merchant)

Setiap merchant memiliki schema terpisah dengan struktur identik. Berikut adalah definisi tabel untuk satu schema tenant.

3.1 Users & Authentication

sqlCopy

-- ============================================

-- SCHEMA: tenant_{slug}

-- TABEL: users

-- DESKRIPSI: Staff dan team members merchant

-- ============================================



CREATE TABLE users (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Profile

    email               VARCHAR(255) UNIQUE NOT NULL,

    password_hash       VARCHAR(255) NOT NULL,

    full_name           VARCHAR(255) NOT NULL,

    phone               VARCHAR(20),

    avatar_url          TEXT,

    employee_id         VARCHAR(50), -- ID karyawan internal

    

    -- Role & Permissions (RBAC)

    role                VARCHAR(30) DEFAULT 'cashier' 

                        CHECK (role IN ('owner', 'manager', 'cashier', 'kitchen_staff', 'barista', 'waiter', 'finance', 'inventory_manager')),

    

    -- Custom Permissions (override role defaults)

    permissions         JSONB, -- granular permissions jika diperlukan

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    email_verified      BOOLEAN DEFAULT FALSE,

    can_login           BOOLEAN DEFAULT TRUE,

    

    -- Shift & Schedule

    default_shift       VARCHAR(20), -- morning, afternoon, evening, full_day

    

    -- Security

    pin_code            VARCHAR(255), -- untuk quick login di cashier terminal

    last_login_at       TIMESTAMP WITH TIME ZONE,

    last_login_ip       INET,

    session_token       VARCHAR(255),

    

    -- Audit

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_by          UUID REFERENCES users(id),

    deleted_at          TIMESTAMP WITH TIME ZONE

);



-- Role Permissions Reference Table (untuk aplikasi layer)

CREATE TABLE role_permissions (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role                VARCHAR(30) UNIQUE NOT NULL,

    permissions         JSONB NOT NULL, -- { "module": ["read", "write", "delete"] }

    description         TEXT,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- Sessions untuk PWA/Cashier

CREATE TABLE user_sessions (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,

    device_type         VARCHAR(20) CHECK (device_type IN ('cashier_tablet', 'mobile', 'desktop', 'kds')),

    device_name         VARCHAR(100),

    device_id           VARCHAR(255), -- unique device identifier

    fcm_token           TEXT, -- untuk push notification

    ip_address          INET,

    is_active           BOOLEAN DEFAULT TRUE,

    last_activity_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    expires_at          TIMESTAMP WITH TIME ZONE

);

3.2 Menu Management

sqlCopy

-- ============================================

-- TABEL: categories

-- DESKRIPSI: Kategori menu (Coffee, Tea, Food, etc.)

-- ============================================



CREATE TABLE categories (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Info Dasar

    name                VARCHAR(100) NOT NULL, -- "Kopi Susu", "Pastry"

    description         TEXT,

    color               VARCHAR(7) DEFAULT '#7C8B6F', -- untuk UI tagging

    

    -- Hierarchy

    parent_id           UUID REFERENCES categories(id), -- untuk sub-kategori

    sort_order          INTEGER DEFAULT 0,

    

    -- Display

    image_url           TEXT,

    is_visible          BOOLEAN DEFAULT TRUE, -- tampil di menu?

    

    -- Metadata

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_by          UUID REFERENCES users(id),

    

    -- Soft delete (jangan hapus kategori yang punya produk aktif)

    deleted_at          TIMESTAMP WITH TIME ZONE

);



-- ============================================

-- TABEL: products

-- DESKRIPSI: Menu items

-- ============================================



CREATE TABLE products (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Identifikasi

    sku                 VARCHAR(50), -- internal code

    name                VARCHAR(255) NOT NULL, -- "Kopi Susu Gula Aren"

    description         TEXT, -- deskripsi artistik untuk customer app

    short_description   VARCHAR(100), -- untuk display cepat

    

    -- Kategori & Tipe

    category_id         UUID REFERENCES categories(id),

    product_type        VARCHAR(20) DEFAULT 'simple' 

                        CHECK (product_type IN ('simple', 'variable', 'composite', 'addon')),

    

    -- Pricing

    base_price          DECIMAL(12,2) NOT NULL,

    cost_price          DECIMAL(12,2), -- untuk COGS calculation

    tax_rate            DECIMAL(5,2) DEFAULT 11.00, -- PPN Indonesia default

    

    -- Inventory Link (opsional)

    track_inventory     BOOLEAN DEFAULT FALSE,

    inventory_item_id   UUID, -- references inventory_items jika linked

    

    -- Display

    image_url           TEXT,

    gallery_images      JSONB, -- array of URLs

    

    -- Status

    status              VARCHAR(20) DEFAULT 'active' 

                        CHECK (status IN ('active', 'out_of_stock', 'seasonal', 'discontinued')),

    is_featured         BOOLEAN DEFAULT FALSE,

    

    -- Metadata

    preparation_time    INTEGER, -- dalam menit, untuk KDS estimation

    allergens           JSONB, -- ["dairy", "gluten", "nuts"]

    nutritional_info    JSONB, -- { calories, sugar, protein, etc }

    

    -- Customization

    has_modifiers       BOOLEAN DEFAULT FALSE, -- punya variant/modifier?

    

    -- Audit

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_by          UUID REFERENCES users(id),

    deleted_at          TIMESTAMP WITH TIME ZONE

);



CREATE INDEX idx_products_category ON products(category_id);

CREATE INDEX idx_products_status ON products(status);

CREATE INDEX idx_products_type ON products(product_type);



-- ============================================

-- TABEL: product_variants

-- DESKRIPSI: Varian ukuran, suhu, dll

-- ============================================



CREATE TABLE product_variants (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,

    

    -- Variant Attributes

    variant_name        VARCHAR(100) NOT NULL, -- "Hot", "Iced", "Large"

    sku_suffix          VARCHAR(20), -- ditambahkan ke SKU parent

    

    -- Pricing Override

    price_adjustment    DECIMAL(12,2) DEFAULT 0.00, -- +5000 untuk Large

    final_price         DECIMAL(12,2) GENERATED ALWAYS AS (base_price + price_adjustment) STORED,

    

    -- Inventory

    track_inventory     BOOLEAN DEFAULT FALSE,

    

    -- Display Order

    sort_order          INTEGER DEFAULT 0,

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: modifier_groups

-- DESKRIPSI: Grup opsi customisasi (Level Kemanisan, Pilihan Susu)

-- ============================================



CREATE TABLE modifier_groups (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    name                VARCHAR(100) NOT NULL, -- "Level Kemanisan"

    description         TEXT,

    is_required         BOOLEAN DEFAULT FALSE, -- harus dipilih?

    min_select          INTEGER DEFAULT 0,

    max_select          INTEGER DEFAULT 1, -- 1 = single, >1 = multiple

    

    -- Display

    sort_order          INTEGER DEFAULT 0,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: modifiers

-- DESKRIPSI: Opsi individual dalam grup

-- ============================================



CREATE TABLE modifiers (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    modifier_group_id   UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,

    

    name                VARCHAR(100) NOT NULL, -- "Less Sugar", "Normal", "Extra Sweet"

    description         TEXT,

    

    -- Pricing

    price_adjustment    DECIMAL(12,2) DEFAULT 0.00, -- bisa negatif atau positif

    

    -- Inventory impact (jika modifier pakai stok tambahan)

    inventory_impact  JSONB, -- { "item_id": "sugar_100g", "qty": -10 }

    

    sort_order          INTEGER DEFAULT 0,

    is_active           BOOLEAN DEFAULT TRUE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: product_modifier_links

-- DESKRIPSI: Many-to-many: Product <-> Modifier Groups

-- ============================================



CREATE TABLE product_modifier_links (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id          UUID REFERENCES products(id) ON DELETE CASCADE,

    modifier_group_id   UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,

    

    -- Override group settings untuk product ini

    is_required         BOOLEAN, -- NULL = use group default

    min_select          INTEGER,

    max_select          INTEGER,

    sort_order          INTEGER DEFAULT 0,

    

    UNIQUE(product_id, modifier_group_id)

);

3.3 Orders & Transactions

sqlCopy

-- ============================================

-- TABEL: orders

-- DESKRIPSI: Master order data

-- ============================================



CREATE TABLE orders (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Identifikasi

    order_number        VARCHAR(20) UNIQUE NOT NULL, -- "ORD-20240327-0001"

    invoice_number      VARCHAR(50), -- untuk keperluan pajak

    

    -- Source

    source              VARCHAR(20) DEFAULT 'cashier' 

                        CHECK (source IN ('cashier', 'customer_app', 'online', 'third_party')),

    device_id           UUID REFERENCES user_sessions(id), -- device yang membuat order

    

    -- Customer Info (untuk non-walk-in atau loyalty)

    customer_id         UUID, -- references customers table jika ada loyalty program

    customer_name       VARCHAR(255), -- untuk walk-in tanpa registrasi

    customer_phone      VARCHAR(20),

    

    -- Order Details

    order_type          VARCHAR(20) DEFAULT 'dine_in' 

                        CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'reservation')),

    table_number        VARCHAR(20), -- untuk dine-in

    guest_count         INTEGER DEFAULT 1,

    

    -- Status Workflow

    status              VARCHAR(20) DEFAULT 'pending' 

                        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),

    payment_status      VARCHAR(20) DEFAULT 'unpaid' 

                        CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded', 'failed')),

    

    -- Financial

    subtotal            DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    tax_total           DECIMAL(15,2) DEFAULT 0.00,

    discount_total      DECIMAL(15,2) DEFAULT 0.00,

    service_charge      DECIMAL(15,2) DEFAULT 0.00,

    delivery_fee        DECIMAL(15,2) DEFAULT 0.00,

    grand_total         DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    

    -- Currency & Rounding

    currency            VARCHAR(3) DEFAULT 'IDR',

    rounding_amount     DECIMAL(15,2) DEFAULT 0.00, -- pembulatan rupiah

    

    -- Payment

    payment_method      VARCHAR(50), -- 'cash', 'qris', 'debit_card', 'credit_card', 'e_wallet'

    payment_reference   VARCHAR(255), -- external payment ID

    paid_at             TIMESTAMP WITH TIME ZONE,

    

    -- Timestamps

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    confirmed_at        TIMESTAMP WITH TIME ZONE,

    completed_at        TIMESTAMP WITH TIME ZONE,

    cancelled_at        TIMESTAMP WITH TIME ZONE,

    cancel_reason       TEXT,

    

    -- Staff

    created_by          UUID REFERENCES users(id), -- cashier/waiter

    cancelled_by        UUID REFERENCES users(id),

    

    -- Notes

    customer_notes      TEXT, -- catatan dari customer

    internal_notes      TEXT, -- catatan internal staff

    

    -- Metadata

    metadata            JSONB, -- flexible data

    

    -- Finance Integration (untuk SAK EP)

    is_synced_to_finance BOOLEAN DEFAULT FALSE,

    finance_synced_at   TIMESTAMP WITH TIME ZONE,

    journal_entry_ids   JSONB -- array of finance journal IDs

);



CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;

CREATE INDEX idx_orders_date_range ON orders(created_at) WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';



-- ============================================

-- TABEL: order_items

-- DESKRIPSI: Line items dalam order

-- ============================================



CREATE TABLE order_items (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    

    -- Product Reference (denormalized untuk history)

    product_id          UUID REFERENCES products(id),

    product_name        VARCHAR(255) NOT NULL, -- snapshot nama saat order

    product_sku         VARCHAR(50),

    

    -- Variant

    variant_id          UUID REFERENCES product_variants(id),

    variant_name        VARCHAR(100),

    

    -- Quantity & Pricing

    quantity            INTEGER NOT NULL DEFAULT 1,

    unit_price          DECIMAL(12,2) NOT NULL, -- harga saat order

    original_price      DECIMAL(12,2), -- harga asli sebelum diskon

    discount_amount     DECIMAL(12,2) DEFAULT 0.00,

    subtotal            DECIMAL(15,2) GENERATED ALWAYS AS ((unit_price * quantity) - discount_amount) STORED,

    

    -- Tax

    tax_rate            DECIMAL(5,2),

    tax_amount          DECIMAL(15,2),

    

    -- Modifiers (JSON untuk flexibility)

    modifiers           JSONB, -- [

                                --   { "group": "Level Kemanisan", "selected": ["Less Sugar"], "price_adj": -2000 },

                                --   { "group": "Pilihan Susu", "selected": ["Oat Milk"], "price_adj": 5000 }

                                -- ]

    

    -- Status (untuk KDS individual item tracking)

    item_status         VARCHAR(20) DEFAULT 'pending' 

                        CHECK (item_status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),

    

    -- Kitchen Assignment

    assigned_station    VARCHAR(50), -- 'bar', 'kitchen', 'pastry'

    started_at          TIMESTAMP WITH TIME ZONE, -- waktu mulai masak

    ready_at            TIMESTAMP WITH TIME ZONE, -- waktu selesai

    

    -- Notes

    special_instructions  TEXT, -- "Less ice, extra shot"

    

    -- Inventory (denormalized)

    cost_of_goods       DECIMAL(12,2), -- COGS untuk laporan profit

    

    sort_order          INTEGER DEFAULT 0,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE INDEX idx_order_items_status ON order_items(item_status);

CREATE INDEX idx_order_items_station ON order_items(assigned_station, item_status);



-- ============================================

-- TABEL: order_payments

-- DESKRIPSI: Split payment support

-- ============================================



CREATE TABLE order_payments (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    

    payment_type        VARCHAR(50) NOT NULL, -- 'cash', 'qris', 'debit_card', etc.

    amount              DECIMAL(15,2) NOT NULL,

    tip_amount          DECIMAL(15,2) DEFAULT 0.00, -- tip untuk waiter

    

    -- External Reference

    reference_number    VARCHAR(255), -- nomor referensi payment gateway

    external_data       JSONB, -- response dari payment gateway

    

    -- Status

    status              VARCHAR(20) DEFAULT 'pending' 

                        CHECK (status IN ('pending', 'success', 'failed', 'refunded')),

    

    processed_at        TIMESTAMP WITH TIME ZONE,

    processed_by        UUID REFERENCES users(id),

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: order_status_history

-- DESKRIPSI: Audit trail perubahan status (untuk tracking)

-- ============================================



CREATE TABLE order_status_history (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,

    

    from_status         VARCHAR(20),

    to_status           VARCHAR(20) NOT NULL,

    

    changed_by          UUID REFERENCES users(id),

    changed_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    

    reason              TEXT,

    metadata            JSONB

);

3.4 Inventory Management

sqlCopy

-- ============================================

-- TABEL: inventory_items

-- DESKRIPSI: Master data bahan baku

-- ============================================



CREATE TABLE inventory_items (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Identifikasi

    sku                 VARCHAR(50) UNIQUE,

    name                VARCHAR(255) NOT NULL, -- "Arabica Beans - Ethiopia", "Fresh Milk 1L"

    description         TEXT,

    

    -- Kategori

    category            VARCHAR(50), -- 'beverage', 'food_ingredient', 'packaging', 'cleaning'

    subcategory         VARCHAR(50),

    

    -- Unit Management

    base_unit           VARCHAR(20) NOT NULL, -- 'gram', 'ml', 'piece', 'pack'

    purchase_unit       VARCHAR(20), -- 'kg', 'liter', 'box' (jika berbeda dari base)

    conversion_factor   DECIMAL(10,4) DEFAULT 1.0000, -- 1 kg = 1000 gram

    

    -- Stock Tracking

    current_stock       DECIMAL(15,4) DEFAULT 0.0000, -- dalam base_unit

    min_stock_level     DECIMAL(15,4) DEFAULT 0.0000, -- alert threshold

    max_stock_level     DECIMAL(15,4), -- optimal stock

    

    -- Location

    default_storage     VARCHAR(100), -- "Gudang Utama", "Kulkas Bar"

    

    -- Costing

    avg_cost_price      DECIMAL(15,4) DEFAULT 0.0000, -- average cost (FIFO/Weighted)

    last_purchase_price DECIMAL(15,4),

    

    -- Supplier

    preferred_supplier_id UUID,

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    is_direct_sale      BOOLEAN DEFAULT FALSE, -- bisa dijual langsung sebagai produk?

    

    -- Metadata

    shelf_life_days     INTEGER, -- kadaluarsa setelah berapa hari

    allergen_info       JSONB,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: inventory_transactions

-- DESKRIPSI: Semua pergerakan stok

-- ============================================



CREATE TABLE inventory_transactions (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Reference

    item_id             UUID REFERENCES inventory_items(id),

    

    -- Transaction Details

    transaction_type    VARCHAR(20) NOT NULL 

                        CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'waste', 'transfer_in', 'transfer_out', 'production', 'return')),

    

    quantity            DECIMAL(15,4) NOT NULL, -- positif = masuk, negatif = keluar

    unit_cost           DECIMAL(15,4), -- harga per unit saat transaksi

    

    -- Reference Documents

    reference_type      VARCHAR(50), -- 'purchase_order', 'order', 'adjustment_note'

    reference_id        UUID, -- bisa ke berbagai tabel (polymorphic)

    

    -- Context

    notes               TEXT,

    performed_by        UUID REFERENCES users(id),

    

    -- Expiry (untuk F&B yang perlu tracking kadaluarsa)

    batch_number        VARCHAR(50),

    expiry_date         DATE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



CREATE INDEX idx_inv_trans_item ON inventory_transactions(item_id);

CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);

CREATE INDEX idx_inv_trans_date ON inventory_transactions(created_at);



-- ============================================

-- TABEL: suppliers

-- DESKRIPSI: Data supplier bahan baku

-- ============================================



CREATE TABLE suppliers (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    name                VARCHAR(255) NOT NULL,

    contact_person      VARCHAR(255),

    email               VARCHAR(255),

    phone               VARCHAR(20),

    address             TEXT,

    

    payment_terms       VARCHAR(50), -- 'cod', 'net_15', 'net_30'

    

    is_active           BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: purchase_orders

-- DESKRIPSI: PO ke supplier

-- ============================================



CREATE TABLE purchase_orders (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    po_number           VARCHAR(50) UNIQUE NOT NULL,

    

    supplier_id         UUID REFERENCES suppliers(id),

    

    status              VARCHAR(20) DEFAULT 'draft' 

                        CHECK (status IN ('draft', 'sent', 'partial', 'received', 'cancelled')),

    

    order_date          DATE DEFAULT CURRENT_DATE,

    expected_date       DATE,

    

    subtotal            DECIMAL(15,2),

    tax_amount          DECIMAL(15,2),

    total_amount        DECIMAL(15,2),

    

    notes               TEXT,

    created_by          UUID REFERENCES users(id),

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE purchase_order_items (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_order_id   UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,

    

    inventory_item_id   UUID REFERENCES inventory_items(id),

    quantity            DECIMAL(15,4) NOT NULL,

    unit_price          DECIMAL(15,4) NOT NULL,

    total_price         DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    

    received_qty        DECIMAL(15,4) DEFAULT 0.0000,

    

    notes               TEXT

);

3.5 Finance Module (SAK EP Compliance)

sqlCopy

-- ============================================

-- TABEL: finance_accounts

-- DESKRIPSI: Chart of Accounts berbasis SAK EP

-- ============================================



CREATE TABLE finance_accounts (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- SAK EP Structure: Level 1-5

    account_code        VARCHAR(20) UNIQUE NOT NULL, -- "1-1000", "5-2000", dll

    account_name        VARCHAR(255) NOT NULL,

    

    -- Hierarchy

    level               INTEGER CHECK (level BETWEEN 1 AND 5),

    parent_id           UUID REFERENCES finance_accounts(id),

    

    -- Classification SAK EP

    account_type        VARCHAR(50) NOT NULL 

                        CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),

    sub_type            VARCHAR(50), -- 'current_asset', 'fixed_asset', 'current_liability', etc.

    

    -- Normal Balance

    normal_balance      VARCHAR(10) CHECK (normal_balance IN ('debit', 'credit')),

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    is_bank_account     BOOLEAN DEFAULT FALSE,

    is_cash_account     BOOLEAN DEFAULT FALSE,

    

    -- Opening Balance

    opening_balance     DECIMAL(15,2) DEFAULT 0.00,

    opening_balance_date DATE,

    

    -- Metadata

    description         TEXT,

    sak_ep_reference    VARCHAR(50), -- referensi ke standar SAK EP

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- Seed data untuk struktur dasar SAK EP

INSERT INTO finance_accounts (account_code, account_name, level, account_type, sub_type, normal_balance) VALUES

-- Aset (1)

('1-0000', 'ASET', 1, 'asset', NULL, 'debit'),

('1-1000', 'Aset Lancar', 2, 'asset', 'current_asset', 'debit'),

('1-1100', 'Kas dan Setara Kas', 3, 'asset', 'current_asset', 'debit'),

('1-1110', 'Kas di Tangan', 4, 'asset', 'current_asset', 'debit'),

('1-1120', 'Bank - Rekening Operasional', 4, 'asset', 'current_asset', 'debit'),



-- Pendapatan (4)

('4-0000', 'PENDAPATAN', 1, 'revenue', NULL, 'credit'),

('4-1000', 'Pendapatan Usaha', 2, 'revenue', 'operating_revenue', 'credit'),

('4-1100', 'Penjualan', 3, 'revenue', 'operating_revenue', 'credit'),

('4-1110', 'Penjualan Makanan', 4, 'revenue', 'operating_revenue', 'credit'),

('4-1120', 'Penjualan Minuman', 4, 'revenue', 'operating_revenue', 'credit'),



-- Beban (5)

('5-0000', 'BEBAN', 1, 'expense', NULL, 'debit'),

('5-1000', 'Beban Pokok Pendapatan', 2, 'expense', 'cogs', 'debit'),

('5-1100', 'Beban Bahan Baku', 3, 'expense', 'cogs', 'debit'),

('5-2000', 'Beban Operasional', 2, 'expense', 'operating_expense', 'debit');



-- ============================================

-- TABEL: finance_journal_entries

-- DESKRIPSI: Jurnal umum (General Journal)

-- ============================================



CREATE TABLE finance_journal_entries (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Identifikasi

    entry_number        VARCHAR(50) UNIQUE NOT NULL, -- "JE-20240327-0001"

    reference_type      VARCHAR(50), -- 'order', 'purchase', 'adjustment', 'manual'

    reference_id        UUID, -- polymorphic reference

    

    -- Dates

    entry_date          DATE NOT NULL,

    posting_date        DATE, -- tanggal diposting ke ledger

    fiscal_year         INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM entry_date)) STORED,

    fiscal_period       INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM entry_date)) STORED,

    

    -- Description

    description         TEXT NOT NULL,

    memo                TEXT,

    

    -- Totals (harus balance: debits = credits)

    total_debit         DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    total_credit        DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    

    -- Status

    status              VARCHAR(20) DEFAULT 'draft' 

                        CHECK (status IN ('draft', 'posted', 'reversed', 'voided')),

    is_reversing_entry  BOOLEAN DEFAULT FALSE,

    reversed_entry_id   UUID REFERENCES finance_journal_entries(id),

    

    -- Audit

    created_by          UUID REFERENCES users(id),

    posted_by           UUID REFERENCES users(id),

    posted_at           TIMESTAMP WITH TIME ZONE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- Constraint: Total debit harus sama dengan total credit

ALTER TABLE finance_journal_entries 

ADD CONSTRAINT check_balanced CHECK (total_debit = total_credit);



-- ============================================

-- TABEL: finance_journal_entry_lines

-- DESKRIPSI: Detail debit/credit per akun

-- ============================================



CREATE TABLE finance_journal_entry_lines (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    journal_entry_id    UUID REFERENCES finance_journal_entries(id) ON DELETE CASCADE,

    

    line_number         INTEGER NOT NULL,

    

    account_id          UUID REFERENCES finance_accounts(id),

    

    -- Amounts

    debit_amount        DECIMAL(15,2) DEFAULT 0.00,

    credit_amount       DECIMAL(15,2) DEFAULT 0.00,

    

    -- Description per line

    description         TEXT,

    cost_center         VARCHAR(50), -- untuk analisa lebih detail

    project_code        VARCHAR(50),

    

    -- Reference untuk tracing

    source_type         VARCHAR(50), -- 'order_item', 'inventory_transaction'

    source_id           UUID,

    

    UNIQUE(journal_entry_id, line_number)

);



-- Trigger untuk auto-update total di header

CREATE OR REPLACE FUNCTION update_journal_entry_totals()

RETURNS TRIGGER AS $$

BEGIN

    UPDATE finance_journal_entries

    SET 

        total_debit = (SELECT COALESCE(SUM(debit_amount), 0) FROM finance_journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id),

        total_credit = (SELECT COALESCE(SUM(credit_amount), 0) FROM finance_journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id),

        updated_at = CURRENT_TIMESTAMP

    WHERE id = NEW.journal_entry_id;

    

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_update_journal_totals

    AFTER INSERT OR UPDATE OR DELETE ON finance_journal_entry_lines

    FOR EACH ROW

    EXECUTE FUNCTION update_journal_entry_totals();



-- ============================================

-- TABEL: finance_account_balances

-- DESKRIPSI: Snapshot balance per akun per periode (untuk performance reporting)

-- ============================================



CREATE TABLE finance_account_balances (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    account_id          UUID REFERENCES finance_accounts(id),

    fiscal_year         INTEGER NOT NULL,

    fiscal_period       INTEGER NOT NULL, -- 1-12 untuk monthly, bisa juga 13-16 untuk quarterly adjustments

    

    -- Balance types

    beginning_balance   DECIMAL(15,2) DEFAULT 0.00,

    period_debits       DECIMAL(15,2) DEFAULT 0.00,

    period_credits      DECIMAL(15,2) DEFAULT 0.00,

    ending_balance      DECIMAL(15,2) GENERATED ALWAYS AS (beginning_balance + period_debits - period_credits) STORED,

    

    UNIQUE(account_id, fiscal_year, fiscal_period)

);



-- ============================================

-- TABEL: tax_configurations

-- DESKRIPSI: Setup pajak (PPN, PPh, dll)

-- ============================================



CREATE TABLE tax_configurations (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    tax_name            VARCHAR(100) NOT NULL, -- "PPN 11%", "PPh 23"

    tax_code            VARCHAR(20) UNIQUE NOT NULL, -- "PPN-11", "PPH-23"

    

    tax_type            VARCHAR(20) CHECK (tax_type IN ('vat', 'income_tax', 'withholding', 'other')),

    rate_percent        DECIMAL(5,2) NOT NULL, -- 11.00 untuk 11%

    

    -- Accounting

    payable_account_id  UUID REFERENCES finance_accounts(id), -- akun hutang pajak

    receivable_account_id UUID REFERENCES finance_accounts(id), -- akun piutang pajak (untuk PPN Masukan)

    expense_account_id  UUID REFERENCES finance_accounts(id), -- akun beban pajak

    

    is_active           BOOLEAN DEFAULT TRUE,

    is_default          BOOLEAN DEFAULT FALSE, -- untuk auto-apply pada transaksi baru

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

3.6 Wallet & Subscription (Flex Plan)

sqlCopy

-- ============================================

-- TABEL: wallet_transactions

-- DESKRIPSI: Mutasi saldo untuk Flex Plan

-- ============================================



CREATE TABLE wallet_transactions (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Reference ke tenant di public schema (denormalized untuk query cepat)

    tenant_id           UUID NOT NULL, -- references public.tenants(id)

    

    -- Transaction Details

    transaction_type    VARCHAR(20) NOT NULL 

                        CHECK (transaction_type IN ('topup', 'usage', 'refund', 'adjustment', 'bonus')),

    

    amount              DECIMAL(15,2) NOT NULL, -- positif untuk topup, negatif untuk usage

    balance_before      DECIMAL(15,2) NOT NULL,

    balance_after       DECIMAL(15,2) NOT NULL,

    

    -- Context

    description         TEXT, -- "Top-up via Bank Transfer", "Usage: Order #1234"

    

    -- Link ke order jika usage

    order_id            UUID REFERENCES orders(id),

    

    -- Top-up details

    payment_method      VARCHAR(50), -- 'bank_transfer', 'credit_card', 'e_wallet'

    payment_reference   VARCHAR(255),

    external_data       JSONB,

    

    -- Status

    status              VARCHAR(20) DEFAULT 'completed' 

                        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),

    

    performed_by        UUID REFERENCES users(id), -- admin yang input (jika manual)

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    processed_at        TIMESTAMP WITH TIME ZONE

);



CREATE INDEX idx_wallet_trans_tenant ON wallet_transactions(tenant_id);

CREATE INDEX idx_wallet_trans_date ON wallet_transactions(created_at);



-- ============================================

-- TABEL: subscription_invoices

-- DESKRIPSI: Invoice untuk Regular plan (monthly/yearly)

-- ============================================



CREATE TABLE subscription_invoices (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    invoice_number      VARCHAR(50) UNIQUE NOT NULL,

    

    -- Period

    billing_period_start DATE NOT NULL,

    billing_period_end   DATE NOT NULL,

    

    -- Charges

    base_amount         DECIMAL(15,2) NOT NULL, -- harga plan

    discount_amount     DECIMAL(15,2) DEFAULT 0.00,

    tax_amount          DECIMAL(15,2) DEFAULT 0.00,

    total_amount        DECIMAL(15,2) NOT NULL,

    

    -- Proration (untuk mid-cycle changes)

    is_prorated         BOOLEAN DEFAULT FALSE,

    proration_reason    TEXT,

    

    -- Status

    status              VARCHAR(20) DEFAULT 'draft' 

                        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

    paid_at             TIMESTAMP WITH TIME ZONE,

    paid_amount         DECIMAL(15,2),

    

    -- Payment

    payment_method      VARCHAR(50),

    payment_reference   VARCHAR(255),

    

    -- Reminders

    reminder_sent_at    TIMESTAMP WITH TIME ZONE[],

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    due_date            DATE NOT NULL

);

3.7 Customer Data (untuk Loyalty & Customer App)

sqlCopy

-- ============================================

-- TABEL: customers

-- DESKRIPSI: Data pelanggan (walk-in yang registrasi atau repeat)

-- ============================================



CREATE TABLE customers (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    -- Profile

    full_name           VARCHAR(255),

    phone               VARCHAR(20) UNIQUE, -- primary identifier untuk Indonesia

    email               VARCHAR(255),

    

    -- Preferences

    preferences         JSONB, -- { "favorite_items": ["uuid1", "uuid2"], "allergens": ["dairy"] }

    

    -- Loyalty

    loyalty_points      INTEGER DEFAULT 0,

    loyalty_tier        VARCHAR(20) DEFAULT 'member' 

                        CHECK (loyalty_tier IN ('member', 'silver', 'gold', 'platinum')),

    

    -- Stats

    total_visits        INTEGER DEFAULT 0,

    total_spent         DECIMAL(15,2) DEFAULT 0.00,

    last_visit_at       TIMESTAMP WITH TIME ZONE,

    first_visit_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    

    -- Referral

    referral_code       VARCHAR(20) UNIQUE,

    referred_by         UUID REFERENCES customers(id),

    

    -- Status

    is_active           BOOLEAN DEFAULT TRUE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: customer_addresses

-- DESKRIPSI: Untuk delivery (future expansion)

-- ============================================



CREATE TABLE customer_addresses (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id         UUID REFERENCES customers(id) ON DELETE CASCADE,

    

    label               VARCHAR(50), -- "Rumah", "Kantor"

    address             TEXT NOT NULL,

    city                VARCHAR(100),

    postal_code         VARCHAR(10),

    coordinates         POINT, -- lat, long untuk maps

    

    is_default          BOOLEAN DEFAULT FALSE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

3.8 Settings & Configurations

sqlCopy

-- ============================================

-- TABEL: app_settings

-- DESKRIPSI: Konfigurasi aplikasi per tenant

-- ============================================



CREATE TABLE app_settings (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    setting_key         VARCHAR(100) UNIQUE NOT NULL,

    setting_value       JSONB NOT NULL,

    data_type           VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array')),

    description         TEXT,

    is_editable         BOOLEAN DEFAULT TRUE,

    

    updated_by          UUID REFERENCES users(id),

    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- Default settings

INSERT INTO app_settings (setting_key, setting_value, data_type, description) VALUES

('receipt.header_text', '"Terima kasih telah berkunjung"', 'string', 'Teks header struk'),

('receipt.footer_text', '"Sampai jumpa kembali"', 'string', 'Teks footer struk'),

('order.auto_cancel_minutes', '30', 'number', 'Otomatis cancel order unpaid setelah X menit'),

('kds.alert_threshold_minutes', '15', 'number', 'Alert merah di KDS setelah X menit'),

('inventory.low_stock_alert', 'true', 'boolean', 'Notifikasi stok rendak aktif'),

('finance.auto_sync_orders', 'true', 'boolean', 'Otomatis buat journal entry dari order');



-- ============================================

-- TABEL: printers

-- DESKRIPSI: Konfigurasi printer per device/station

-- ============================================



CREATE TABLE printers (

    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    

    name                VARCHAR(100) NOT NULL, -- "Printer Kasir", "Printer Dapur"

    device_type         VARCHAR(20) CHECK (device_type IN ('usb', 'bluetooth', 'network', 'cloud')),

    

    connection_string   TEXT, -- IP address, MAC, atau cloud printer ID

    printer_model       VARCHAR(100),

    

    -- Function

    print_receipts      BOOLEAN DEFAULT TRUE,

    print_kitchen_tickets BOOLEAN DEFAULT FALSE,

    print_order_tickets BOOLEAN DEFAULT FALSE,

    

    -- Template

    receipt_template    JSONB, -- custom template config

    

    is_active           BOOLEAN DEFAULT TRUE,

    last_connected_at   TIMESTAMP WITH TIME ZONE,

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- ============================================

-- TABEL: audit_logs

-- DESKRIPSI: Comprehensive audit trail

-- ============================================



CREATE TABLE audit_logs (

    id                  BIGSERIAL PRIMARY KEY, -- bigserial untuk high volume

    

    -- Actor

    user_id             UUID REFERENCES users(id),

    user_email          VARCHAR(255), -- denormalized untuk history

    user_role           VARCHAR(30),

    

    -- Action

    action              VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'export'

    entity_type         VARCHAR(50) NOT NULL, -- 'order', 'product', 'inventory', 'finance'

    entity_id           UUID, -- ID record yang diubah

    

    -- Details

    old_values          JSONB,

    new_values          JSONB,

    ip_address          INET,

    user_agent          TEXT,

    

    -- Context

    session_id          UUID,

    request_id          VARCHAR(100), -- untuk tracing

    

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



CREATE INDEX idx_audit_user ON audit_logs(user_id);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_action ON audit_logs(action);

CREATE INDEX idx_audit_date ON audit_logs(created_at);



4. ORM Configuration (TypeORM/Prisma Style)

4.1 Entity Relationship Diagram (Simplified)

plainCopy

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé   tenants   ΓöéΓùäΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöé    users    ΓöéΓùäΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöé   orders    Γöé

Γöé   (public)  Γöé       Γöé  (tenant)   Γöé       Γöé  (tenant)   Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ

                                                  Γöé

                       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ           Γöé

                       Γöé   products  ΓöéΓùäΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

                       Γöé  (tenant)   Γöé           Γöé

                       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ           Γöé

                              Γöé                  Γöé

                       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö┤ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ          Γöé

                       Γöé   categoriesΓöé          Γöé

                       Γöé  (tenant)   Γöé          Γöé

                       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ          Γöé

                                                Γöé

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ          Γöé

Γöé   finance_  ΓöéΓùäΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöéfinance_journalΓöéΓùäΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ

Γöé  accounts   Γöé       Γöé   entries    Γöé

Γöé  (tenant)   Γöé       Γöé  (tenant)   Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ

4.2 TypeORM Entity Example (Reference)

Berikut adalah contoh pola Entity yang bisa digunakan dengan TypeORM:

TypeScriptCopy

// Contoh pola untuk Order Entity

@Entity('orders')

export class Order {

  @PrimaryGeneratedColumn('uuid')

  id: string;



  @Column({ type: 'varchar', length: 20, unique: true })

  orderNumber: string;



  @Column({ 

    type: 'enum', 

    enum: ['dine_in', 'takeaway', 'delivery'],

    default: 'dine_in'

  })

  orderType: OrderType;



  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })

  grandTotal: number;



  @Column({ type: 'simple-json', nullable: true })

  metadata: Record<string, any>;



  @CreateDateColumn({ type: 'timestamptz' })

  createdAt: Date;



  @UpdateDateColumn({ type: 'timestamptz' })

  updatedAt: Date;



  // Relations

  @ManyToOne(() => User, user => user.orders)

  @JoinColumn({ name: 'created_by' })

  createdBy: User;



  @OneToMany(() => OrderItem, item => item.order, { cascade: true })

  items: OrderItem[];



  @OneToMany(() => OrderPayment, payment => payment.order)

  payments: OrderPayment[];

}

4.3 Prisma Schema Example

prismaCopy

// schema.prisma untuk tenant schema

model Order {

  id              String   @id @default(uuid())

  orderNumber     String   @unique @map("order_number")

  orderType       OrderType @default(dine_in) @map("order_type")

  status          OrderStatus @default(pending)

  

  subtotal        Decimal  @db.Decimal(15, 2)

  taxTotal        Decimal  @default(0) @map("tax_total") @db.Decimal(15, 2)

  grandTotal      Decimal  @map("grand_total") @db.Decimal(15, 2)

  

  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()

  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  

  // Relations

  items           OrderItem[]

  payments        OrderPayment[]

  createdBy       User?    @relation(fields: [createdById], references: [id])

  createdById     String?  @map("created_by")

  

  @@index([status])

  @@index([createdAt])

  @@map("orders")

}



enum OrderType {

  dine_in

  takeaway

  delivery

}



enum OrderStatus {

  pending

  confirmed

  preparing

  ready

  served

  completed

  cancelled

}



5. Database Functions & Triggers

5.1 Auto-generate Order Number

sqlCopy

CREATE OR REPLACE FUNCTION generate_order_number()

RETURNS TRIGGER AS $$

DECLARE

    date_part VARCHAR;

    sequence_part VARCHAR;

    new_number VARCHAR;

BEGIN

    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

    

    -- Get next sequence for today

    SELECT COALESCE(MAX(SUBSTRING(order_number FROM 14)::INTEGER), 0) + 1

    INTO sequence_part

    FROM orders

    WHERE order_number LIKE 'ORD-' || date_part || '-%';

    

    new_number := 'ORD-' || date_part || '-' || LPAD(sequence_part::TEXT, 4, '0');

    

    NEW.order_number := new_number;

    

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_generate_order_number

    BEFORE INSERT ON orders

    FOR EACH ROW

    WHEN (NEW.order_number IS NULL)

    EXECUTE FUNCTION generate_order_number();

5.2 Auto-update Inventory on Order Completion

sqlCopy

CREATE OR REPLACE FUNCTION deduct_inventory_on_sale()

RETURNS TRIGGER AS $$

BEGIN

    -- Hanya proses jika order completed dan belum diproses inventory

    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN

        -- Insert inventory transaction untuk setiap item

        INSERT INTO inventory_transactions (

            item_id, transaction_type, quantity, 

            reference_type, reference_id, notes

        )

        SELECT 

            pi.inventory_item_id,

            'sale',

            (oi.quantity * pi.quantity_required) * -1, -- negative untuk keluar

            'order',

            NEW.id,

            'Auto-deduct from order ' || NEW.order_number

        FROM order_items oi

        JOIN product_inventory_links pi ON pi.product_id = oi.product_id

        WHERE oi.order_id = NEW.id

        AND pi.inventory_item_id IS NOT NULL;

        

        -- Update current_stock di inventory_items

        UPDATE inventory_items ii

        SET current_stock = ii.current_stock - sub.deduction_qty,

            updated_at = CURRENT_TIMESTAMP

        FROM (

            SELECT pi.inventory_item_id, 

                   SUM(oi.quantity * pi.quantity_required) as deduction_qty

            FROM order_items oi

            JOIN product_inventory_links pi ON pi.product_id = oi.product_id

            WHERE oi.order_id = NEW.id

            GROUP BY pi.inventory_item_id

        ) sub

        WHERE ii.id = sub.inventory_item_id;

    END IF;

    

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_deduct_inventory

    AFTER UPDATE ON orders

    FOR EACH ROW

    EXECUTE FUNCTION deduct_inventory_on_sale();

5.3 Auto-create Finance Journal Entry dari Order

sqlCopy

CREATE OR REPLACE FUNCTION create_journal_from_order()

RETURNS TRIGGER AS $$

DECLARE

    je_id UUID;

    cash_account_id UUID;

    revenue_account_id UUID;

    tax_account_id UUID;

BEGIN

    -- Hanya untuk order yang baru paid

    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN

        -- Get default accounts (biasanya di-setting di app_settings atau hardcoded)

        SELECT id INTO cash_account_id FROM finance_accounts 

        WHERE account_code = '1-1110' AND is_active = true LIMIT 1;

        

        SELECT id INTO revenue_account_id FROM finance_accounts 

        WHERE account_code = '4-1110' AND is_active = true LIMIT 1;

        

        -- Create Journal Entry Header

        INSERT INTO finance_journal_entries (

            entry_number, reference_type, reference_id,

            entry_date, description, total_debit, total_credit,

            status, created_by

        ) VALUES (

            'JE-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 

            (SELECT COALESCE(MAX(SUBSTRING(entry_number FROM 14)::INTEGER), 0) + 1 

             FROM finance_journal_entries WHERE entry_number LIKE 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%')::TEXT,

            'order',

            NEW.id,

            CURRENT_DATE,

            'Penjualan ' || NEW.order_number || ' - ' || NEW.customer_name,

            NEW.grand_total,

            NEW.grand_total,

            'posted',

            NEW.created_by

        ) RETURNING id INTO je_id;

        

        -- Debit: Kas

        INSERT INTO finance_journal_entry_lines (

            journal_entry_id, line_number, account_id,

            debit_amount, credit_amount, description

        ) VALUES (

            je_id, 1, cash_account_id,

            NEW.grand_total, 0,

            'Penerimaan ' || NEW.payment_method

        );

        

        -- Credit: Pendapatan (net of tax)

        INSERT INTO finance_journal_entry_lines (

            journal_entry_id, line_number, account_id,

            debit_amount, credit_amount, description

        ) VALUES (

            je_id, 2, revenue_account_id,

            0, NEW.subtotal - NEW.discount_total,

            'Penjualan produk'

        );

        

        -- Credit: PPN Keluaran (jika ada)

        IF NEW.tax_total > 0 THEN

            SELECT id INTO tax_account_id FROM finance_accounts 

            WHERE account_code = '2-1300' LIMIT 1; -- Hutang PPN

            

            INSERT INTO finance_journal_entry_lines (

                journal_entry_id, line_number, account_id,

                debit_amount, credit_amount, description

            ) VALUES (

                je_id, 3, tax_account_id,

                0, NEW.tax_total,

                'PPN ' || NEW.tax_rate || '%'

            );

        END IF;

        

        -- Update order dengan reference ke journal

        NEW.is_synced_to_finance := true;

        NEW.finance_synced_at := CURRENT_TIMESTAMP;

        NEW.journal_entry_ids := jsonb_build_array(je_id);

    END IF;

    

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



6. Migration Strategy

6.1 Initial Migration Structure

sqlCopy

-- 001_create_public_schema.sql

-- Run sebagai superuser



-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- Create schema management function

CREATE OR REPLACE FUNCTION setup_tenant_schema(schema_name TEXT)

RETURNS void AS $$

BEGIN

    -- Create schema

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

    

    -- Grant privileges

    EXECUTE format('GRANT ALL ON SCHEMA %I TO CURRENT_USER', schema_name);

    

    -- Set search path

    EXECUTE format('SET search_path TO %I, public', schema_name);

    

    -- Create tenant tables (run semua DDL dari section 3)

    -- ... (semua CREATE TABLE statements untuk tenant schema)

    

    -- Setup triggers

    -- ...

    

    -- Insert default data

    INSERT INTO app_settings (setting_key, setting_value, data_type) 

    VALUES ('tenant.initialized', 'true', 'boolean');

    

    -- Reset search path

    RESET search_path;

END;

$$ LANGUAGE plpgsql;

6.2 Tenant Provisioning Flow

plainCopy

1. User register di landing page

   Γåô

2. Create record di public.tenants

   Γåô

3. Trigger auto-create schema tenant_{slug}

   Γåô

4. Run setup_tenant_schema() untuk create semua tabel

   Γåô

5. Insert default data (settings, finance accounts, admin user)

   Γåô

6. Send welcome email dengan login credentials

   Γåô

7. Redirect ke dashboard tenant



7. Query Optimization & Indexing Strategy

7.1 Critical Indexes

sqlCopy

-- Orders: Query by date range (dashboard analytics)

CREATE INDEX CONCURRENTLY idx_orders_created_at_brin 

ON orders USING BRIN (created_at) 

WITH (pages_per_range = 128); -- untuk table partitioning by time



-- Order Items: Query by status untuk KDS

CREATE INDEX CONCURRENTLY idx_order_items_kds 

ON order_items(item_status, assigned_station, created_at) 

WHERE item_status IN ('pending', 'preparing');



-- Inventory: Low stock alert query

CREATE INDEX CONCURRENTLY idx_inventory_low_stock 

ON inventory_items(current_stock, min_stock_level) 

WHERE current_stock <= min_stock_level AND is_active = true;



-- Finance: Period balance queries

CREATE INDEX CONCURRENTLY idx_finance_period 

ON finance_account_balances(fiscal_year, fiscal_period, account_id);

7.2 Partitioning Strategy (untuk scale)

sqlCopy

-- Partition orders table by month untuk performance

CREATE TABLE orders_2024_03 PARTITION OF orders

FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');



-- Auto-create partitions via cron/pg_partman



8. Backup & Security

8.1 Row Level Security (RLS) untuk Multi-tenant

sqlCopy

-- Enable RLS pada tabel tenant

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;



-- Policy: Users hanya bisa lihat data tenant mereka

CREATE POLICY tenant_isolation_policy ON orders

FOR ALL

TO application_user

USING (tenant_id = current_setting('app.current_tenant')::UUID);

8.2 Encryption

sqlCopy

-- Encrypt sensitive data di application layer atau pgcrypto

-- Contoh: Encrypt customer phone

UPDATE customers 

SET phone = pgp_sym_encrypt(phone, current_setting('app.encryption_key'));



9. Summary Schema Count

Table

Schema

Tabel

Purpose

public

6

Master data, CMS, system admin

tenant_{slug}

25+

Business data per merchant

Total Entities per Tenant:

Users & Auth: 3 tabel

Menu Management: 6 tabel

Orders: 4 tabel

Inventory: 5 tabel

Finance: 6 tabel

Wallet: 2 tabel

Customers: 2 tabel

System: 4 tabel


