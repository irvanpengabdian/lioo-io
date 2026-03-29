

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




--- Content of lioo.io PRD.docx ---


lioo.io - Product Requirements Document

The Living Atelier: A Point of Sale Ecosystem for Culinary Artisans



1. Executive Summary

lioo.io adalah SaaS POS (Point of Sale) yang dirancang khusus untuk industri F&B dan coffee shop dengan pendekatan filosofis "The Living Atelier" ΓÇö sebuah ruang kerja hidup di mana setiap interaksi, transaksi, dan proses dianggap sebagai bagian dari karya seni kuliner. Platform ini menggabungkan teknologi modern dengan estetika yang humanis, menciptakan pengalaman operasional yang tidak hanya efisien tetapi juga bermakna.

Domain: lioo.io (sudah dibeli dan aktif)



2. Product Vision & Philosophy

2.1 The Living Atelier Concept

lioo.io mengadopsi filosofi atelier (bengkel/bengkel kerja seniman) sebagai paradigma desain:

Kehidupan: Sistem yang beradaptasi dan tumbuh bersama bisnis

Karya: Setiap transaksi adalah bagian dari masterpiece bisnis

Ruang: Interface yang menenangkan, bukan membebani

Kolaborasi: Hubungan harmonis antara tim, customer, dan teknologi

2.2 Brand Voice & Tone

Table

Konteks

Pendekatan

Formal

Profesional namun hangat, menghindari jargon teknis

CTA Buttons

Menggunakan metafora artistik (bukan instruksi teknis)

Error Messages

Empatik, mengalihkan frustrasi menjadi pemahaman

Success States

Apresiatif tanpa berlebihan, mengaktirikan usaha user

2.3 Glossary of Terms (Brand Language)

Table

Fungsi

Standar Industri

lioo.io Atelier Style

Tambah Menu

"Add Menu"

"Jalin Menu Baru"

Simpan Perubahan

"Save Changes"

"Abadikan Perubahan"

Hapus Produk

"Delete Item"

"Lepas dari Katalog"

Filter Data

"Filter Data"

"Kurasi Catatan"

Koneksi Error

"Error 500"

"Ruang kerja kehilangan koneksi"

Data Not Found

"Data tidak ditemukan"

"Tidak ditemukan di sudut studio"

Save Failed

"Gagal menyimpan"

"Hambatan menyimpan mahakarya"

Low Balance

"Saldo rendah"

"Kredit transaksi hampir habis"

Upgrade Needed

"Upgrade required"

"Luaskan batas untuk kreativitas"



3. System Architecture Overview

plainCopy

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé                     lioo.io ECOSYSTEM                       Γöé

Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

Γöé                                                             Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  Γöé

Γöé  Γöé   LANDING   Γöé  Γöé     CMS     Γöé  Γöé   ADMIN DASHBOARD   Γöé  Γöé

Γöé  Γöé    PAGE     Γöé  Γöé   (Content) Γöé  Γöé   (Super Admin)     Γöé  Γöé

Γöé  Γöé  (Public)   Γöé  Γöé  (Internal) Γöé  Γöé    (Internal)       Γöé  Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  Γöé

Γöé                                                             Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉΓöé

Γöé  Γöé              MERCHANT DASHBOARD (Web App)               ΓöéΓöé

Γöé  Γöé  ΓÇó Profile Setup  ΓÇó Menu Management  ΓÇó Team & Permission ΓöéΓöé

Γöé  Γöé  ΓÇó Wallet/Saldo   ΓÇó Transaction      ΓÇó Inventory        ΓöéΓöé

Γöé  Γöé  ΓÇó Finance/SAK EP ΓÇó Analytics                            ΓöéΓöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿΓöé

Γöé                                                             Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ Γöé

Γöé  Γöé    CASHIER  Γöé  Γöé   CUSTOMER    Γöé  Γöé   KITCHEN DISPLAY   Γöé Γöé

Γöé  Γöé   TERMINAL  Γöé  Γöé    ORDERING   Γöé  Γöé      (KDS)          Γöé Γöé

Γöé  Γöé   (PWA)     Γöé  Γöé    (PWA)      Γöé  Γöé   (Kanban Style)    Γöé Γöé

Γöé  Γöé             Γöé  Γöé  [Add-on]     Γöé  Γöé                     Γöé Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ Γöé

Γöé                                                             Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ



4. Frontend Specifications

4.1 Landing Page

Purpose: Konversi visitor menjadi registered merchant

Sections (based on uploaded design):

Table

Section

Content

Atelier Touch

Hero

"The Artisan Way to Manage Your Merchant" + Device mockup

Warm sage green palette, elegant typography

Process Flow

"Effortless Operations" - 4 steps: Isi Saldo, Jualan, Habiskan, Top-up Lagi

Iconography dengan sentuhan artisanal

Pricing

3 tiers: Starter (Free), Flex (Rp 200/transaksi), Regular (Rp 899k/mo)

"Pilih Paket Favorit" badge on Flex

ROI Calculator

Interactive slider untuk projected savings

"Hitung Keuntungan Bersih Anda"

CTA Section

"Ready to grow your merchant?"

Full-width green gradient background

Footer

Company links, social, copyright

Minimalist, breathable spacing

Design System:

Primary Color: Sage Green (#7C8B6F atau similar warm green)

Secondary: Cream/Off-white backgrounds

Typography: Elegant serif untuk headings, clean sans-serif untuk body

Spacing: Generous whitespace untuk kesan "atelier yang lapang"



4.2 Cashier Terminal (PWA)

Purpose: Primary order processing untuk walk-in customers

Core Features:

Table

Feature

Specification

Atelier Terminology

Order Types

Dine-in, Takeaway

"Makan di Tempat", "Bawa Pulang"

Menu Display

Grid view dengan kategori, search, favorites

"Katalog Hari Ini"

Customization

Modifiers (less sugar, extra shot, etc.)

"Personalisasi Cita Rasa"

Cart Management

Add, edit, delete items

"Susun Pesanan"

Payment

Cash, Cashless (QRIS, Debit, E-wallet)

"Selesaikan Transaksi"

Receipt

Digital + print option

"Cetak Kenangan"

Offline Mode

Queue orders, sync when online

"Mode Terisolasi - Sinkronisasi Nanti"

UI Requirements:

Touch-optimized untuk tablet (primary device)

Dark mode option untuk penggunaan marathon

Quick actions dengan gesture support

Split bill functionality untuk group orders



4.3 Customer Ordering (PWA) - Add-on Feature

Purpose: Self-service ordering via table scan untuk paket Flex/Regular

Activation: Optional add-on, activated per merchant subscription tier

Features:

Table

Feature

Specification

Atelier Terminology

Table Scan

QR code scan untuk akses menu

"Pindai untuk Memulai Pengalaman"

Menu Browsing

Full menu dengan gambar, deskripsi artistik

"Jelajahi Katalog"

Order Customization

Same modifiers as cashier

"Racik Sesuai Selera"

Payment Options

Bayar di Kasir / Bayar Langsung

"Selesaikan di Meja" / "Selesaikan Sekarang"

Order Tracking

Real-time status: Diterima ΓåÆ Diproses ΓåÆ Siap

"Perjalanan Pesanan Anda"

Order History

Riwayat pesanan customer

"Koleksi Pengalaman"

Order Status Flow:

plainCopy

Diterima di Dapur ΓåÆ Sedang Disiapkan ΓåÆ Penyajian Akhir ΓåÆ Siap Diambil

     (Received)      (Preparing)       (Final Touch)     (Ready)



4.4 Kitchen Display System (KDS)

Purpose: Visual management untuk kitchen operations dalam format Kanban

Layout: Board-based dengan columns yang merepresentasikan stage

Kanban Columns:

Table

Column

Atelier Name

Function

New Orders

"Antrean Masuk"

Orders yang baru diterima dari cashier/customer app

Preparation

"Sedang Dikerjakan"

Orders yang sedang diproses oleh kitchen staff

Quality Check

"Peninjauan Akhir"

Final check sebelum serving (optional column)

Ready

"Siap Disajikan"

Orders yang selesai dan menunggu pickup/delivery

Features:

Card-based orders dengan detail item, modifiers, notes, waktu tunggu

Color coding berdasarkan urgency (green ΓåÆ yellow ΓåÆ red untuk SLA breach)

Sound notifications untuk new orders dengan customizable tones

Bump bar integration untuk hardware button confirmation

Multi-station support (Bar station, Kitchen station, Pastry station)

Interaction:

Drag-and-drop antar columns

Tap untuk expand detail

Swipe untuk mark complete atau return to previous stage



4.5 Merchant Dashboard (Web App)

Purpose: Central command center untuk business management

Modules:

A. Profile & Settings

Restaurant/Coffee Shop profile (logo, info, jam operasional)

Branding customization (warna tema, receipt template)

Location management (untuk multi-branch)

B. Menu Management

Kategori Menu: Struktur hierarkis dengan drag-drop

Menu Items: Nama, deskripsi, harga, gambar, availability toggle

Customisasi Menu:

Modifier groups (contoh: "Level Kemanisan", "Pilihan Susu")

Add-on items

Variant management (size, temperature)

C. Team & Permission Management

Role-based access: Owner, Manager, Cashier, Kitchen, Finance

Permission matrix granular (view, create, edit, delete per module)

Shift scheduling integration (future roadmap)

D. Wallet & Subscription (Flex Plan)

Saldo Tracking: Real-time credit untuk pay-per-transaction

Top-up Interface: Multiple payment methods

Usage History: Transaksi yang menggunakan kredit

Low Balance Alerts: Notifikasi threshold customizable

E. Transaction Dashboard

Real-time sales monitoring

Filter by date, shift, payment method, order type

Export capabilities (PDF, Excel)

Void/Refund management dengan audit trail

F. Inventory Management

Bahan Baku Tracking: Stok masuk, keluar, sisa

Low Stock Alerts: Threshold-based notifications

Predictive Alerts: "Habis dalam X hari" berdasarkan usage pattern

Supplier Management: Katalog supplier, PO history

G. Finance Module (SAK EP Compliance)

Chart of Accounts: Standar Akuntansi Keuangan Entitas Privat

Jurnal Entries: Otomatis dari transaksi POS

Financial Statements:

Laporan Posisi Keuangan (Neraca)

Laporan Laba Rugi

Laporan Arus Kas

Laporan Perubahan Ekuitas

Tax Management: PPN, PPh preparation

Audit Trail: Complete history perubahan financial data



4.6 Finance Frontend (SAK EP Module)

Purpose: Dedicated interface untuk accounting dan financial reporting

Compliance: Standar Akuntansi Keuangan Entitas Privat (SAK EP)

Features:

Table

Feature

Specification

General Ledger

Double-entry bookkeeping dengan account codes SAK EP

Accounts Mapping

Mapping transaksi POS ke akun-akun SAK EP otomatis

Period Closing

Monthly/yearly closing dengan adjustment entries

Financial Reports

Standard SAK EP reports dengan formatting yang sesuai

Tax Reports

SPT preparation helpers

Multi-book

Jika diperlukan untuk berbagai keperluan (tax vs management)



4.7 CMS (Content Management System)

Purpose: Internal tool untuk mengelola landing page dan marketing content

Access: Super Admin, Marketing Team

Capabilities:

Table

Module

Function

Content Editor

WYSIWYG editor untuk landing page sections

Pricing Management

Update harga subscription, promo codes

Blog/Articles

Publish content marketing

Testimonials

Manage customer stories

Feature Showcases

Update feature explanations

Hardware List

Manage supported devices catalog

Promo Campaigns

Create discount codes, bundle offers



5. Backend & Infrastructure Requirements

5.1 Core Services

Table

Service

Technology Stack

Purpose

API Gateway

Kong/AWS API Gateway

Routing, rate limiting, auth

Auth Service

OAuth 2.0 + JWT

Multi-tenant authentication

Order Service

Node.js/Go

Core order processing

Payment Service

Integration dengan payment gateways

Transaction processing

Inventory Service

Python/Node.js

Stock management

Finance Service

Specialized accounting engine

SAK EP compliance

Notification Service

WebSocket + Push

Real-time updates

File Storage

AWS S3/Cloudflare R2

Images, receipts, exports

Database

PostgreSQL (primary), Redis (cache)

Data persistence

5.2 Multi-tenancy Architecture

Tenant Isolation: Database-level separation (schema per tenant)

Custom Domain: Support untuk merchant custom domain (optional)

White-label: Branding customization per tenant



6. Pricing Strategy (Revised dari Design)

6.1 Subscription Tiers

Table

Tier

Price

Target

Key Features

Starter

Free

Pop-up shops, UMKM baru

5 produk, basic analytics, custom domain, 1 user

Flex

Rp 200/transaksi

Event-based, seasonal

Unlimited products, advanced dashboard, 24/7 support, API access, pay-as-you-go

Regular

Rp 899k/bulan

Established business

Everything in Flex + custom branding, multi-location sync, customer ordering add-on, inventory module

6.2 Add-ons (Optional)

Table

Add-on

Price

Description

Customer Ordering

Rp 299k/bulan atau +Rp 50/transaksi

Self-service table ordering

Additional Location

Rp 399k/bulan/location

Multi-branch expansion

Advanced Inventory

Rp 199k/bulan

Predictive stock management

Finance Module

Rp 499k/bulan

Full SAK EP compliance

Priority Support

Rp 199k/bulan

Dedicated support channel



7. User Experience (UX) Principles

7.1 The Atelier Experience Guidelines

Breathing Room: Minimum 24px padding, generous whitespace

Progressive Disclosure: Jangan overwhelm user dengan semua options sekaligus

Contextual Help: Tooltips dan hints dengan bahasa atelier

Feedback yang Human: Success states yang mengapresiasi, error states yang memahami

Consistency: Same interaction patterns across all frontends

Performance: < 2s load time untuk semua critical paths

7.2 Accessibility

WCAG 2.1 AA compliance

Keyboard navigation support

Screen reader optimized

Color contrast minimum 4.5:1



8. Security & Compliance

Table

Aspect

Requirement

Data Encryption

AES-256 at rest, TLS 1.3 in transit

Payment Security

PCI DSS Level 1 compliance

Authentication

MFA support, session management

Audit Logging

Complete activity logs untuk compliance

Backup

Daily automated backup, 30-day retention

GDPR/PDP

Data privacy compliance untuk customer data



9. Success Metrics (KPIs)

Table

Category

Metric

Target

Acquisition

Monthly Signups

500+ merchants/month (Year 1)

Activation

First Transaction within 48h

> 70%

Retention

Monthly Active Merchants

> 85%

Revenue

MRR (Monthly Recurring Revenue)

Growth 15% MoM

Satisfaction

NPS Score

> 50

Performance

Uptime SLA

99.9%

Support

First Response Time

< 4 hours



10. Roadmap & Phasing

Phase 1: MVP (Months 1-3)

Landing page dengan CMS

Cashier Terminal PWA (core POS)

Basic Merchant Dashboard (profile, simple menu, transactions)

Wallet system untuk Flex plan

Phase 2: Growth (Months 4-6)

Kitchen Display System

Customer Ordering PWA (add-on)

Advanced Menu Management (modifiers, variants)

Inventory basics

Phase 3: Scale (Months 7-9)

Finance Module (SAK EP)

Multi-location support

Advanced analytics

API ecosystem

Phase 4: Optimize (Months 10-12)

AI-powered insights

Advanced inventory prediction

Marketplace integrations

International expansion preparation



11. Appendix

A. Technical Stack Recommendation

Table

Layer

Technology

Frontend

React/Next.js + Tailwind CSS

Mobile PWA

React Native atau Flutter

Backend

Node.js (Express/NestJS) atau Go

Database

PostgreSQL + Redis

Cloud

AWS atau Google Cloud Platform

CDN

Cloudflare

Monitoring

Datadog atau New Relic

B. Integration Requirements

Payment Gateways: Midtrans, Xendit, Stripe

Accounting: Accurate, Jurnal, QuickBooks (optional)

Hardware: Printer Bluetooth/USB, Barcode scanner, Cash drawer

Delivery: GoFood, GrabFood, ShopeeFood (future)

C. Brand Assets Needed

Logo variations (horizontal, vertical, icon)

Color palette guidelines (primary, secondary, neutrals, semantic)

Typography system (display, body, monospace)

Iconography set (custom atau curated)

Photography style guide untuk marketing materials



12. Conclusion

lioo.io adalah lebih dari sekadar POS system ΓÇö ini adalah living atelier yang tumbuh bersama culinary artisans. Dengan filosofi yang kuat, teknologi yang solid, dan pengalaman pengguna yang humanis, lioo.io akan menjadi platform pilihan untuk generasi baru merchant F&B yang menghargai keindahan dalam operasional sehari-hari.









Next Steps:

Finalisasi design system berdasarkan landing page yang sudah ada

Setup development environment dan CI/CD pipeline

Kickoff Phase 1 development (MVP)

Recruit beta merchant partners untuk early feedback



Dokumen ini adalah living document dan akan terus diperbarui seiring dengan iterasi produk.

Version: 1.0

Date: 27 Maret 2026

Status: Draft for Review




--- Content of lioo.io Vercel Optimized Architecture.docx ---


lioo.io - Vercel-Optimized Architecture

1. Philosophy: Serverless-First SaaS

plainCopy

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé                    VERCEL ECOSYSTEM (Managed)                           Γöé

Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

Γöé                                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ   Γöé

Γöé  Γöé  FRONTEND LAYER (Vercel Edge Network)                          Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  ΓÇó landing-page (lioo.io)            ΓåÆ Next.js Static + ISR    Γöé   Γöé

Γöé  Γöé  ΓÇó dashboard (app.lioo.io)           ΓåÆ Next.js App Router      Γöé   Γöé

Γöé  Γöé  ΓÇó pos (pos.lioo.io)                 ΓåÆ Next.js PWA             Γöé   Γöé

Γöé  Γöé  ΓÇó kitchen (kds.lioo.io)             ΓåÆ Next.js PWA             Γöé   Γöé

Γöé  Γöé  ΓÇó customer (order.lioo.io)          ΓåÆ Next.js PWA             Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Features:                                                      Γöé   Γöé

Γöé  Γöé  ΓÇó Global CDN (Edge Network)                                   Γöé   Γöé

Γöé  Γöé  ΓÇó Automatic HTTPS + HTTP/2                                     Γöé   Γöé

Γöé  Γöé  ΓÇó ISR (Incremental Static Regeneration)                       Γöé   Γöé

Γöé  Γöé  ΓÇó Edge Middleware (Auth, A/B testing)                         Γöé   Γöé

Γöé  Γöé  ΓÇó Image Optimization                                           Γöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ   Γöé

Γöé                                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ   Γöé

Γöé  Γöé  API LAYER (Vercel Serverless Functions)                      Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  ΓÇó /api/* routes ΓåÆ Serverless Functions (Node.js 18+)         Γöé   Γöé

Γöé  Γöé  ΓÇó /api/edge/*   ΓåÆ Edge Functions (V8 Isolate, 0ms cold start)Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Function Splitting:                                            Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/auth/*      ΓåÆ Auth API (login, register, refresh)   Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/orders/*    ΓåÆ Order API (CRUD, workflow)            Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/payments/*  ΓåÆ Payment API (webhooks, process)         Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/menu/*      ΓåÆ Menu API (products, categories)        Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/inventory/* ΓåÆ Inventory API (stock, alerts)           Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/finance/*   ΓåÆ Finance API (SAK EP, reports)           Γöé   Γöé

Γöé  Γöé  ΓööΓöÇΓöÇ /api/webhooks/*  ΓåÆ External webhooks (midtrans, etc)     Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Edge Functions (Ultra-low latency):                            Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/edge/tenant-resolve ΓåÆ Subdomain ΓåÆ Tenant ID           Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/edge/rate-limit     ΓåÆ Redis-backed rate limiting      Γöé   Γöé

Γöé  Γöé  Γö£ΓöÇΓöÇ /api/edge/geo-route      ΓåÆ Route ke region terdekat        Γöé   Γöé

Γöé  Γöé  ΓööΓöÇΓöÇ /api/edge/ab-test        ΓåÆ Experiment routing              Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Limits (Hobby vs Pro vs Enterprise):                         Γöé   Γöé

Γöé  Γöé  ΓÇó Function timeout: 10s ΓåÆ 60s ΓåÆ 900s                          Γöé   Γöé

Γöé  Γöé  ΓÇó Memory: 1024MB ΓåÆ 1024MB ΓåÆ 3008MB                            Γöé   Γöé

Γöé  Γöé  ΓÇó Concurrent: 1000 ΓåÆ Unlimited ΓåÆ Unlimited                    Γöé   Γöé

Γöé  Γöé  ΓÇó Execution: 100GB-hrs/mo ΓåÆ Unlimited ΓåÆ Unlimited           Γöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ   Γöé

Γöé                                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ   Γöé

Γöé  Γöé  REAL-TIME LAYER (Vercel + Upstash Redis)                     Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  ΓÇó WebSocket tidak native di Vercel (stateless)               Γöé   Γöé

Γöé  Γöé  ΓÇó Solusi: Serverless WebSocket dengan Upstash Redis           Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Options:                                                       Γöé   Γöé

Γöé  Γöé  1. Pusher / Ably (Managed, $$$)                                Γöé   Γöé

Γöé  Γöé  2. Upstash Redis Pub/Sub + Serverless Events (Recommended)    Γöé   Γöé

Γöé  Γöé  3. PartyKit / Cloudflare Durable Objects (Alternative)        Γöé   Γöé

Γöé  Γöé                                                                 Γöé   Γöé

Γöé  Γöé  Architecture:                                                  Γöé   Γöé

Γöé  Γöé  Client ΓöÇΓöÇΓû║ Vercel Edge ΓöÇΓöÇΓû║ Upstash Redis ΓöÇΓöÇΓû║ Serverless Event Γöé   Γöé

Γöé  Γöé                Function           Pub/Sub         Handler        Γöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ   Γöé

Γöé                                                                         Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ



ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé              EXTERNAL MANAGED SERVICES (Vercel Integrations)            Γöé

Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

Γöé                                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ    Γöé

Γöé  Γöé  Neon       Γöé  Γöé  Upstash    Γöé  Γöé  Clerk      Γöé  Γöé  Stripe     Γöé    Γöé

Γöé  Γöé  (Postgres) Γöé  Γöé  (Redis)    Γöé  Γöé  (Auth)     Γöé  Γöé  (Billing)  Γöé    Γöé

Γöé  Γöé             Γöé  Γöé             Γöé  Γöé             Γöé  Γöé             Γöé    Γöé

Γöé  Γöé ΓÇó ServerlessΓöé  Γöé ΓÇó ServerlessΓöé  Γöé ΓÇó SSO/MFA   Γöé  Γöé ΓÇó Subs      Γöé    Γöé

Γöé  Γöé ΓÇó Auto-scaleΓöé  Γöé ΓÇó Pub/Sub   Γöé  Γöé ΓÇó Sessions  Γöé  Γöé ΓÇó Invoices  Γöé    Γöé

Γöé  Γöé ΓÇó Branching Γöé  Γöé ΓÇó Rate LimitΓöé  Γöé ΓÇó RBAC      Γöé  Γöé ΓÇó Webhooks  Γöé    Γöé

Γöé  Γöé ΓÇó $0 start  Γöé  Γöé ΓÇó $0 start  Γöé  Γöé ΓÇó $0 start  Γöé  Γöé ΓÇó Usage-basedΓöé   Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ    Γöé

Γöé                                                                         Γöé

Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ    Γöé

Γöé  Γöé  Cloudflare Γöé  Γöé  Resend     Γöé  Γöé  UploadthingΓöé  Γöé  Logtail    Γöé    Γöé

Γöé  Γöé  (R2/S3)    Γöé  Γöé  (Email)    Γöé  Γöé  (Uploads)  Γöé  Γöé  (Logging)  Γöé    Γöé

Γöé  Γöé             Γöé  Γöé             Γöé  Γöé             Γöé  Γöé             Γöé    Γöé

Γöé  Γöé ΓÇó Receipts  Γöé  Γöé ΓÇó Welcome   Γöé  Γöé ΓÇó Images    Γöé  Γöé ΓÇó StructuredΓöé    Γöé

Γöé  Γöé ΓÇó Exports   Γöé  Γöé ΓÇó Invoices  Γöé  Γöé ΓÇó Documents Γöé  Γöé ΓÇó Alerts    Γöé    Γöé

Γöé  Γöé ΓÇó Backups   Γöé  Γöé ΓÇó Low Stock Γöé  Γöé ΓÇó CDN       Γöé  Γöé ΓÇó Search    Γöé    Γöé

Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ    Γöé

Γöé                                                                         Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ



2. Why Vercel is Perfect for lioo.io

Table

Aspect

Traditional K8s

Vercel Serverless

Benefit for lioo.io

Focus

40% infra, 60% product

90% product

Fokus ke "The Living Atelier"

Scaling

Manual HPA

Auto-zero-to-infinity

Handle event spikes (lunch rush)

Cost

$500+/mo minimum

$0 start, scale with usage

Cocok untuk Flex plan model

Global

Manual CDN setup

Edge Network built-in

Low latency untuk customer PWA

DevOps

Dedicated team

Git-push deploy

Solo founder friendly

WebSocket

Complex (Sticky sessions)

Managed (Pusher/Ably)

Real-time KDS tanpa headache



3. Revised Monorepo for Vercel

plainCopy

lioo-io/

Γö£ΓöÇΓöÇ apps/

Γöé   Γö£ΓöÇΓöÇ web/                         # Landing page (lioo.io)

Γöé   Γöé   Γö£ΓöÇΓöÇ app/                     # Next.js App Router

Γöé   Γöé   Γö£ΓöÇΓöÇ components/

Γöé   Γöé   Γö£ΓöÇΓöÇ content/                 # MDX blog/pricing

Γöé   Γöé   ΓööΓöÇΓöÇ package.json

Γöé   Γöé

Γöé   Γö£ΓöÇΓöÇ dashboard/                   # Merchant portal (app.lioo.io)

Γöé   Γöé   Γö£ΓöÇΓöÇ app/

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ (auth)/              # Login dengan Clerk

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ (main)/              # Authenticated routes

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ layout.tsx       # Shell dengan navigation

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ page.tsx         # Analytics overview

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ menu/

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ inventory/

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ finance/

Γöé   Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ settings/

Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ api/                 # API Routes untuk dashboard

Γöé   Γöé   Γö£ΓöÇΓöÇ components/

Γöé   Γöé   Γö£ΓöÇΓöÇ lib/

Γöé   Γöé   ΓööΓöÇΓöÇ middleware.ts            # Tenant resolution, auth

Γöé   Γöé

Γöé   Γö£ΓöÇΓöÇ pos/                         # Cashier PWA (pos.lioo.io)

Γöé   Γöé   Γö£ΓöÇΓöÇ app/

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ page.tsx             # Main POS interface

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ layout.tsx           # Touch-optimized, no nav

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ api/                 # Sync API, offline queue

Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ manifest.ts          # PWA manifest

Γöé   Γöé   Γö£ΓöÇΓöÇ components/

Γöé   Γöé   Γö£ΓöÇΓöÇ workers/                 # Service workers

Γöé   Γöé   ΓööΓöÇΓöÇ public/

Γöé   Γöé       Γö£ΓöÇΓöÇ manifest.json

Γöé   Γöé       ΓööΓöÇΓöÇ sw.js

Γöé   Γöé

Γöé   Γö£ΓöÇΓöÇ kitchen/                     # KDS PWA (kds.lioo.io)

Γöé   Γöé   Γö£ΓöÇΓöÇ app/

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ page.tsx             # Kanban board

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ api/

Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ [station]/           # Dynamic station routes

Γöé   Γöé   ΓööΓöÇΓöÇ components/

Γöé   Γöé

Γöé   Γö£ΓöÇΓöÇ customer/                    # Ordering PWA (order.lioo.io)

Γöé   Γöé   Γö£ΓöÇΓöÇ app/

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ [tableId]/           # QR scan ΓåÆ table-specific

Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ api/

Γöé   Γöé   ΓööΓöÇΓöÇ components/

Γöé   Γöé

Γöé   ΓööΓöÇΓöÇ api/                         # ΓÜá∩╕Å OPTIONAL: Shared API

Γöé       ΓööΓöÇΓöÇ src/                     # Jika butuh API terpisah

Γöé           ΓööΓöÇΓöÇ routes/              # Tapi sebaiknya colocate

Γöé

Γö£ΓöÇΓöÇ packages/

Γöé   Γö£ΓöÇΓöÇ database/                    # Drizzle ORM (sama)

Γöé   Γö£ΓöÇΓöÇ ui/                          # Design system

Γöé   Γö£ΓöÇΓöÇ realtime/                    # Γ¡É NEW: Real-time abstraction

Γöé   Γöé   Γö£ΓöÇΓöÇ src/

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ providers/

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ pusher.ts      # Production: Pusher

Γöé   Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ ably.ts        # Alternative: Ably

Γöé   Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ upstash.ts     # Cost-effective: Upstash

Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ client.ts          # Universal client

Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ server.ts          # Server-side publisher

Γöé   Γöé   ΓööΓöÇΓöÇ package.json

Γöé   Γö£ΓöÇΓöÇ auth/                        # Clerk wrappers

Γöé   Γö£ΓöÇΓöÇ payments/                    # Stripe/Xendit utils

Γöé   ΓööΓöÇΓöÇ utils/

Γöé

Γö£ΓöÇΓöÇ tooling/

Γöé   ΓööΓöÇΓöÇ vercel.json                  # Multi-domain config

Γöé

Γö£ΓöÇΓöÇ vercel.json                      # Root config (ignored, per-app)

Γö£ΓöÇΓöÇ turbo.json

ΓööΓöÇΓöÇ package.json



4. Vercel Configuration

Root: turbo.json

JSONCopy

{

  "$schema": "https://turbo.build/schema.json",

  "globalDependencies": [".env.local"],

  "pipeline": {

    "build": {

      "dependsOn": ["^build", "^db:generate"],

      "outputs": [".next/**", "!.next/cache/**", ".vercel/output/**"]

    },

    "dev": {

      "cache": false,

      "persistent": true

    },

    "lint": {},

    "type-check": {},

    "deploy": {

      "dependsOn": ["build", "lint", "type-check"]

    }

  }

}

Per-App: vercel.json

apps/dashboard/vercel.json

JSONCopy

{

  "version": 2,

  "name": "lioo-dashboard",

  "alias": ["app.lioo.io"],

  "regions": ["sin1", "hkg1", "syd1"], // Asia-Pacific priority

  "functions": {

    "app/api/**/*.ts": {

      "maxDuration": 30

    }

  },

  "crons": [

    {

      "path": "/api/cron/daily-reports",

      "schedule": "0 6 * * *"

    },

    {

      "path": "/api/cron/wallet-alerts",

      "schedule": "0 */6 * * *"

    }

  ],

  "rewrites": [

    {

      "source": "/api/edge/:path*",

      "destination": "/api/edge/:path*"

    }

  ],

  "headers": [

    {

      "source": "/api/(.*)",

      "headers": [

        {

          "key": "Cache-Control",

          "value": "no-store, max-age=0"

        }

      ]

    },

    {

      "source": "/_next/static/(.*)",

      "headers": [

        {

          "key": "Cache-Control",

          "value": "public, max-age=31536000, immutable"

        }

      ]

    }

  ]

}

apps/pos/vercel.json (PWA)

JSONCopy

{

  "version": 2,

  "name": "lioo-pos",

  "alias": ["pos.lioo.io"],

  "regions": ["sin1", "hkg1"],

  "headers": [

    {

      "source": "/sw.js",

      "headers": [

        {

          "key": "Cache-Control",

          "value": "public, max-age=0, must-revalidate"

        },

        {

          "key": "Service-Worker-Allowed",

          "value": "/"

        }

      ]

    },

    {

      "source": "/manifest.json",

      "headers": [

        {

          "key": "Content-Type",

          "value": "application/manifest+json"

        }

      ]

    }

  ]

}



5. Database: Neon (Serverless Postgres)

Why Neon over self-hosted

Table

Feature

Neon

Self-hosted

Branching

Instant dev branches

Manual dump/restore

Scale to zero

$0 when idle

Always running

Auto-backup

Built-in

Manual setup

Connection pooling

Built-in (PgBouncer)

Manual setup

Storage

Auto-grow

Manual provisioning

Neon Configuration

TypeScriptCopy

// packages/database/src/neon-client.ts

import { neon, neonConfig } from '@neondatabase/serverless';

import { drizzle } from 'drizzle-orm/neon-http';

import { ws } from '@neondatabase/serverless';



// Enable WebSocket untuk transactions (Neon serverless)

neonConfig.webSocketConstructor = ws;



// Connection string dari Vercel env

const connectionString = process.env.DATABASE_URL;



// HTTP client untuk queries (fast, no connection limit)

export const httpClient = drizzle(neon(connectionString), { schema });



// WebSocket client untuk transactions

export const wsClient = drizzle(

  neon(connectionString, { fullProtocolVersion: true }),

  { schema }

);



// Smart client: auto-select berdasarkan operation

export function getDb(operation: 'query' | 'transaction' = 'query') {

  return operation === 'transaction' ? wsClient : httpClient;

}

Neon Branching untuk Development

yamlCopy

# .github/workflows/neon-branch.yml

name: Neon Branch for Preview



on:

  pull_request:

    types: [opened, synchronize]



jobs:

  create-branch:

    runs-on: ubuntu-latest

    steps:

      - uses: neondatabase/create-branch-action@v4

        with:

          project_id: ${{ secrets.NEON_PROJECT_ID }}

          branch_name: preview-${{ github.event.number }}

          api_key: ${{ secrets.NEON_API_KEY }}

      

      - name: Run Migrations

        run: |

          export DATABASE_URL=${{ steps.create-branch.outputs.db_url }}

          pnpm db:migrate



6. Real-Time: Upstash Redis (Cost-Effective)

Architecture: Serverless WebSocket

plainCopy

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ

Γöé              REAL-TIME FLOW (Serverless)              Γöé

Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ

Γöé                                                         Γöé

Γöé  1. CLIENT CONNECTION                                   Γöé

Γöé     POS/KDS ΓöÇΓöÇΓû║ Vercel Edge Function (/api/edge/ws)   Γöé

Γöé                 ΓÇó Validate JWT (Clerk)                Γöé

Γöé                 ΓÇó Determine tenant dari subdomain       Γöé

Γöé                 ΓÇó Generate connection token           Γöé

Γöé                 ΓÇó Return: { token, room, endpoint }     Γöé

Γöé                                                         Γöé

Γöé  2. SUBSCRIBE TO CHANNELS                               Γöé

Γöé     Client ΓöÇΓöÇΓû║ Upstash Redis Pub/Sub                  Γöé

Γöé     ΓÇó SUBSCRIBE tenant:{id}                           Γöé

Γöé     ΓÇó SUBSCRIBE tenant:{id}:station:{name}            Γöé

Γöé     ΓÇó SUBSCRIBE order:{id}                            Γöé

Γöé                                                         Γöé

Γöé  3. SERVER PUBLISH                                      Γöé

Γöé     API Route ΓöÇΓöÇΓû║ Upstash Redis PUBLISH               Γöé

Γöé     ΓÇó Order created ΓåÆ tenant:{id}                     Γöé

Γöé     ΓÇó Item ready ΓåÆ tenant:{id}:station:kitchen        Γöé

Γöé     ΓÇó Payment success ΓåÆ order:{id}                    Γöé

Γöé                                                         Γöé

Γöé  4. CLIENT RECEIVE                                      Γöé

Γöé     Redis ΓöÇΓöÇΓû║ WebSocket/SSE ΓöÇΓöÇΓû║ Client                Γöé

Γöé                                                         Γöé

ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ

Implementation

packages/realtime/src/upstash.ts

TypeScriptCopy

import { Redis } from '@upstash/redis';

import { Ratelimit } from '@upstash/ratelimit';



// Redis client

const redis = new Redis({

  url: process.env.UPSTASH_REDIS_REST_URL,

  token: process.env.UPSTASH_REDIS_REST_TOKEN,

});



// Rate limiter untuk WebSocket connections

const ratelimit = new Ratelimit({

  redis,

  limiter: Ratelimit.slidingWindow(10, '10 s'),

});



// Channel names

export const channels = {

  tenant: (id: string) => `tenant:${id}`,

  station: (tenantId: string, station: string) => 

    `tenant:${tenantId}:station:${station}`,

  order: (id: string) => `order:${id}`,

  user: (id: string) => `user:${id}`,

};



// Publish event

export async function publish<T>(

  channel: string,

  event: string,

  payload: T

) {

  const message = JSON.stringify({

    event,

    payload,

    timestamp: Date.now(),

  });

  

  await redis.publish(channel, message);

  

  // Persist untuk offline clients (5 menit)

  await redis.lpush(`history:${channel}`, message);

  await redis.ltrim(`history:${channel}`, 0, 100);

  await redis.expire(`history:${channel}`, 300);

}



// Get recent history untuk reconnect

export async function getHistory(channel: string, limit = 50) {

  return await redis.lrange(`history:${channel}`, 0, limit);

}



// Presence tracking

export async function setOnline(

  tenantId: string,

  userId: string,

  metadata: object

) {

  const key = `presence:${tenantId}`;

  await redis.hset(key, userId, JSON.stringify({

    ...metadata,

    onlineAt: Date.now(),

  }));

  await redis.expire(key, 60); // Auto-expire after 60s

}



export async function getOnlineUsers(tenantId: string) {

  const key = `presence:${tenantId}`;

  const users = await redis.hgetall(key);

  return Object.entries(users).map(([id, data]) => ({

    userId: id,

    ...JSON.parse(data as string),

  }));

}

apps/dashboard/app/api/edge/ws/route.ts

TypeScriptCopy

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs';

import { ratelimit, channels } from '@lioo/realtime';



export const runtime = 'edge';



export async function GET(req: NextRequest) {

  // 1. Auth

  const { userId, orgId } = auth();

  if (!userId || !orgId) {

    return NextResponse.json(

      { error: 'Akses terbatas' },

      { status: 401 }

    );

  }



  // 2. Rate limit

  const { success } = await ratelimit.limit(userId);

  if (!success) {

    return NextResponse.json(

      { error: 'Terlalu banyak aktivitas' },

      { status: 429 }

    );

  }



  // 3. Get tenant dari subdomain

  const host = req.headers.get('host') || '';

  const subdomain = host.split('.')[0];

  

  // 4. Resolve tenant (cache di Edge Config atau KV)

  const tenant = await resolveTenant(subdomain);

  if (!tenant || tenant.id !== orgId) {

    return NextResponse.json(

      { error: 'Studio tidak ditemukan' },

      { status: 404 }

    );

  }



  // 5. Generate connection config

  const config = {

    token: await generateConnectionToken(userId, tenant.id),

    tenantId: tenant.id,

    channels: [

      channels.tenant(tenant.id),

      channels.user(userId),

    ],

    // Role-specific channels

    ...(user.role === 'kitchen_staff' && {

      channels: [...channels, channels.station(tenant.id, 'kitchen')],

    }),

    upstash: {

      url: process.env.UPSTASH_REDIS_REST_URL,

      token: process.env.UPSTASH_REDIS_REST_TOKEN,

    },

  };



  return NextResponse.json(config);

}

Client-side: Real-time Hook

TypeScriptCopy

// packages/realtime/src/react/use-realtime.ts

'use client';



import { useEffect, useState, useCallback } from 'react';

import { Redis } from '@upstash/redis';



export function useRealtime(config: {

  tenantId: string;

  channels: string[];

  onMessage: (event: string, payload: any) => void;

}) {

  const [isConnected, setIsConnected] = useState(false);

  const [lastMessage, setLastMessage] = useState<Date | null>(null);



  useEffect(() => {

    // Fetch connection config dari Edge Function

    const initConnection = async () => {

      const res = await fetch('/api/edge/ws');

      const { upstash, channels, token } = await res.json();



      // Setup Redis client

      const redis = new Redis({

        url: upstash.url,

        token: upstash.token,

      });



      // Subscribe ke channels menggunakan Server-Sent Events (SSE)

      // atau WebSocket fallback

      const eventSource = new EventSource(

        `/api/sse?channels=${channels.join(',')}&token=${token}`

      );



      eventSource.onmessage = (event) => {

        const data = JSON.parse(event.data);

        config.onMessage(data.event, data.payload);

        setLastMessage(new Date());

      };



      eventSource.onopen = () => setIsConnected(true);

      eventSource.onerror = () => setIsConnected(false);



      return () => eventSource.close();

    };



    initConnection();

  }, [config.tenantId]);



  // Publish function

  const publish = useCallback(async (channel: string, event: string, payload: any) => {

    await fetch('/api/publish', {

      method: 'POST',

      body: JSON.stringify({ channel, event, payload }),

    });

  }, []);



  return { isConnected, lastMessage, publish };

}



7. Authentication: Clerk (Perfect for Vercel)

Why Clerk

Table

Feature

Clerk

Auth0

Firebase Auth

Next.js integration

Native SDK

Manual

Manual

Organization (Multi-tenant)

Built-in

Enterprise $$$

Custom

Session management

Edge-compatible

Node-only

Node-only

Pricing

$0 start

$23/mo start

$0 start

Custom branding

Easy

Complex

Limited

Setup

TypeScriptCopy

// apps/dashboard/middleware.ts

import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';

import { resolveTenant } from '@lioo/tenant';



export default authMiddleware({

  // Public routes yang tidak perlu auth

  publicRoutes: ['/login', '/register', '/api/webhooks/(.*)'],

  

  async afterAuth(auth, req, evt) {

    // Redirect ke login jika belum auth

    if (!auth.userId && !auth.isPublicRoute) {

      return redirectToSignIn({ returnBackUrl: req.url });

    }



    // Resolve tenant dari subdomain

    const host = req.headers.get('host') || '';

    const subdomain = host.split('.')[0];

    const tenant = await resolveTenant(subdomain);



    if (!tenant) {

      return new Response('Studio tidak ditemukan', { status: 404 });

    }



    // Check apakah user punya akses ke tenant ini

    const orgId = auth.orgId;

    if (orgId !== tenant.id) {

      return new Response('Akses ditolak untuk studio ini', { status: 403 });

    }



    // Add tenant context ke request

    req.headers.set('x-tenant-id', tenant.id);

    req.headers.set('x-tenant-slug', tenant.slug);

  },

});



export const config = {

  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],

};



8. Cost Estimation (Vercel + Managed Services)

Scenario: 100 Active Merchants, 10K orders/month

Table

Service

Plan

Monthly Cost

Notes

Vercel

Pro

$20

Unlimited team, 1TB bandwidth

Neon

Launch

$19

10GB storage, 190 compute hours

Upstash Redis

Pay-as-you-go

~$10

10K commands/day, 1GB storage

Clerk

Pro

$25

10K monthly active users

Cloudflare R2

-

~$5

50GB storage, 1M operations

Resend

Free

$0

3K emails/day

Logtail

Free

$0

1GB logs

Stripe

-

$0

Usage-based (2.9% + 30┬ó)

Pusher (optional)

Sandbox

$0

200K messages/day

Total: ~$79/month untuk 100 merchants

Scale Scenario: 1,000 Merchants, 100K orders/month

Table

Service

Upgrade

New Cost

Vercel

Enterprise

$0 (negotiated)

Neon

Scale

$69

Upstash

Pro 2GB

$30

Clerk

Pro (higher tier)

$50

Total



~$150/month



9. Deployment Workflow

yamlCopy

# .github/workflows/deploy.yml

name: Deploy to Vercel



on:

  push:

    branches: [main]

  pull_request:

    branches: [main]



jobs:

  deploy:

    runs-on: ubuntu-latest

    steps:

      - uses: actions/checkout@v4

      

      - uses: pnpm/action-setup@v2

        with:

          version: 8

      

      - name: Install dependencies

        run: pnpm install

      

      - name: Type check

        run: pnpm type-check

      

      - name: Run tests

        run: pnpm test

      

      - name: Deploy Dashboard (app.lioo.io)

        uses: vercel/action-deploy@v1

        with:

          vercel-token: ${{ secrets.VERCEL_TOKEN }}

          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

          vercel-project-id: ${{ secrets.VERCEL_DASHBOARD_PROJECT_ID }}

          working-directory: ./apps/dashboard

      

      - name: Deploy POS (pos.lioo.io)

        uses: vercel/action-deploy@v1

        with:

          vercel-token: ${{ secrets.VERCEL_TOKEN }}

          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

          vercel-project-id: ${{ secrets.VERCEL_POS_PROJECT_ID }}

          working-directory: ./apps/pos

      

      - name: Deploy Kitchen (kds.lioo.io)

        uses: vercel/action-deploy@v1

        with:

          vercel-token: ${{ secrets.VERCEL_TOKEN }}

          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

          vercel-project-id: ${{ secrets.VERCEL_KDS_PROJECT_ID }}

          working-directory: ./apps/kitchen

      

      - name: Deploy Customer (order.lioo.io)

        uses: vercel/action-deploy@v1

        with:

          vercel-token: ${{ secrets.VERCEL_TOKEN }}

          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

          vercel-project-id: ${{ secrets.VERCEL_CUSTOMER_PROJECT_ID }}

          working-directory: ./apps/customer

      

      - name: Deploy Landing (lioo.io)

        uses: vercel/action-deploy@v1

        with:

          vercel-token: ${{ secrets.VERCEL_TOKEN }}

          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

          vercel-project-id: ${{ secrets.VERCEL_WEB_PROJECT_ID }}

          working-directory: ./apps/web



10. Monitoring & Debugging (Vercel-native)

TypeScriptCopy

// apps/dashboard/app/api/health/route.ts

import { NextResponse } from 'next/server';

import { checkDatabaseHealth } from '@lioo/database';

import { redis } from '@lioo/realtime';



export const runtime = 'edge';



export async function GET() {

  const checks = await Promise.all([

    checkDatabaseHealth(),

    redis.ping().then(() => true).catch(() => false),

  ]);



  const healthy = checks.every(c => c);



  return NextResponse.json(

    {

      status: healthy ? 'healthy' : 'degraded',

      timestamp: new Date().toISOString(),

      services: {

        database: checks[0] ? 'up' : 'down',

        cache: checks[1] ? 'up' : 'down',

      },

      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),

    },

    { status: healthy ? 200 : 503 }

  );

}




