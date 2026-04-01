-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'FINANCE');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('SEED', 'SPROUT', 'BLOOM', 'FOREST');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('CASHIER', 'CUSTOMER_APP', 'ONLINE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'ABOUT_US');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "tenantId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'SEED',
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "logoUrl" TEXT,
    "contactNumber" TEXT,
    "merchantCategory" TEXT,
    "address" TEXT,
    "selfServiceTheme" TEXT,
    "maxStaffSeats" INTEGER NOT NULL DEFAULT 1,
    "purchasedExtraSeats" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "guestToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "promoPrice" DOUBLE PRECISION,
    "promoValidUntil" TIMESTAMP(3),
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modifier" (
    "id" TEXT NOT NULL,
    "modifierGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Modifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "source" "OrderSource" NOT NULL DEFAULT 'CASHIER',
    "orderType" "OrderType" NOT NULL DEFAULT 'DINE_IN',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "tableId" TEXT,
    "tableNumber" TEXT,
    "customerId" TEXT,
    "guestSessionId" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "publicOrderCode" TEXT,
    "offlineId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "deviceId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "itemStatus" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "specialInstructions" TEXT,
    "selectedModifiers" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "xenditId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "readTime" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StaffInvite_token_key" ON "StaffInvite"("token");

-- CreateIndex
CREATE INDEX "StaffInvite_tenantId_idx" ON "StaffInvite"("tenantId");

-- CreateIndex
CREATE INDEX "StaffInvite_token_idx" ON "StaffInvite"("token");

-- CreateIndex
CREATE INDEX "StaffInvite_email_idx" ON "StaffInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Table_qrToken_key" ON "Table"("qrToken");

-- CreateIndex
CREATE INDEX "Table_tenantId_idx" ON "Table"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_tenantId_label_key" ON "Table"("tenantId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_guestToken_key" ON "Customer"("guestToken");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_phone_key" ON "Customer"("tenantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "Category"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Product_tenantId_categoryId_idx" ON "Product"("tenantId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicOrderCode_key" ON "Order"("publicOrderCode");

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_idx" ON "Order"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_tenantId_status_idx" ON "Order"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Order_tenantId_offlineId_idx" ON "Order"("tenantId", "offlineId");

-- CreateIndex
CREATE INDEX "Order_tenantId_paymentStatus_idx" ON "Order"("tenantId", "paymentStatus");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNumber_key" ON "Order"("tenantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_xenditId_key" ON "WalletTransaction"("xenditId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_type_key" ON "LegalDocument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffInvite" ADD CONSTRAINT "StaffInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifier" ADD CONSTRAINT "Modifier_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
