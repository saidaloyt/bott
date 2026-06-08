CREATE TABLE IF NOT EXISTS "users" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "telegramId" TEXT NOT NULL,
  "fullName" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "language" TEXT NOT NULL DEFAULT 'ru',
  "accessCode" TEXT,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "isSubAdmin" BOOLEAN NOT NULL DEFAULT false,
  "adminRequest" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "parentId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "price" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "photos" TEXT NOT NULL DEFAULT '[]',
  "categoryId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "cardLastFour" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" INTEGER NOT NULL,
  CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "photo_presets" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "fileId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_telegramId_key" ON "users"("telegramId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_accessCode_key" ON "users"("accessCode");
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");

ALTER TABLE "categories" ADD COLUMN "nameUz" TEXT;
ALTER TABLE "categories" ADD COLUMN "nameRu" TEXT;
ALTER TABLE "categories" ADD COLUMN "nameEn" TEXT;

ALTER TABLE "products" ADD COLUMN "titleUz" TEXT;
ALTER TABLE "products" ADD COLUMN "titleRu" TEXT;
ALTER TABLE "products" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionUz" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionRu" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionEn" TEXT;

UPDATE "categories"
SET "nameRu" = "name",
    "nameUz" = "name",
    "nameEn" = "name"
WHERE "nameRu" IS NULL OR "nameUz" IS NULL OR "nameEn" IS NULL;

UPDATE "products"
SET "titleRu" = "title",
    "titleUz" = "title",
    "titleEn" = "title",
    "descriptionRu" = "description",
    "descriptionUz" = "description",
    "descriptionEn" = "description"
WHERE "titleRu" IS NULL OR "titleUz" IS NULL OR "titleEn" IS NULL;
