-- Align Order table with schema (delivery for DELIVERY order type)
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" TEXT;
