PRAGMA foreign_keys=OFF;

CREATE TABLE "new_order_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" INTEGER NOT NULL,
  CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_order_items" ("id", "orderId", "productId", "quantity", "price")
SELECT "id", "orderId", "productId", "quantity", "price" FROM "order_items";

DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
