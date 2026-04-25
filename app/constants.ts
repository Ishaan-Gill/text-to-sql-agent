export const customerTable = `
CREATE TABLE IF NOT EXISTS "customer" (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'email' TEXT NOT NULL,
    'name' TEXT NOT NULL,
    'city' TEXT NOT NULL,
    'created_at' TEXT NOT NULL
);`;

export const orderTable = `
CREATE TABLE IF NOT EXISTS "order" (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'customerid' INTEGER NOT NULL,
    'amount' REAL,
    'status' TEXT NOT NULL,
    'created_at' TEXT NOT NULL,
    FOREIGN KEY ('customerid') REFERENCES customer('id')
);
`;
export const productTable = `
CREATE TABLE IF NOT EXISTS "product" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT,
    "category" TEXT,
    "price" REAL
);
`;

export const orderItemTable = `
CREATE TABLE IF NOT EXISTS "order_item" (
    "id" INTEGER PRIMARY KEY,
    "order_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER
);
`;