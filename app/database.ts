"use server"

import sqlite3 from "sqlite3";
import { customerTable, orderTable, productTable, orderItemTable } from "./constants"
import { error } from "console";

const db = new sqlite3.Database(":memory:");

function runWithLogging(sql: string, label: string) {
    db.run(sql, (error) => {
        if (error) {
            console.error(`[sqlite] ${label} failed:`, error.message);
            console.error(sql);
        }
    })
}
export async function seed() {
    db.serialize(() => {
        runWithLogging(customerTable, "create customer table");
        runWithLogging(orderTable, "create order table");
        runWithLogging(productTable, "create product table");
        runWithLogging(orderItemTable, "create order_item table");
    });

    db.run(`
REPLACE INTO "customer" ('id', 'name', 'email', 'city', 'created_at')  
VALUES  
    (1, 'Asha Kumari', 'asha.kumari@example.com', 'Delhi', '2024-01-10'),
    (2, 'Rohit Sharma', 'rohit.sharma@example.com', 'Mumbai', '2024-02-15'),
    (3, 'Neha Singh', 'neha.singh@example.com', 'Delhi', '2024-03-05'),
    (4, 'Arjun Mehta', 'arjun.mehta@example.com', 'Bangalore', '2024-01-25'),
    (5, 'Priya Verma', 'priya.verma@example.com', 'Pune', '2024-04-01');
    `);

    db.run(`
REPLACE INTO "order" ('id', 'customerid', 'amount', 'status', 'created_at')
VALUES
    (1, 1, 83000, 'completed', '2024-04-10'),
    (2, 2, 60000, 'pending', '2024-04-11'),
    (3, 1, 3000, 'completed', '2024-04-12'),
    (4, 3, 5000, 'cancelled', '2024-04-13'),
    (5, 4, 80000, 'completed', '2024-04-14');
    `);

    db.run(`
REPLACE INTO "product" ('id', 'name', 'category', 'price')
VALUES
    (1, 'iPhone 15', 'Electronics', 80000),
    (2, 'Laptop', 'Electronics', 60000),
    (3, 'Shoes', 'Fashion', 3000),
    (4, 'Watch', 'Accessories', 5000);
    `);

    db.run(`
REPLACE INTO "order_item" ('id', 'order_id', 'product_id', 'quantity')
VALUES
    (1, 1, 1, 1),
    (2, 1, 3, 1),
    (3, 2, 2, 1),
    (4, 3, 3, 1),
    (5, 4, 4, 1),
    (6, 5, 1, 1);
    `);
}

export async function execute(sql: string) {

    // Securtity:
    const sqlUpper = sql.trim().toUpperCase();
    if (!sqlUpper.startsWith("SELECT")) {
        return { error: "Only SELECT queries are allowed" };
    }

    const allowedTables = ["customer", "order", "product", "order_item"];
    const tables = Array.from(sql.matchAll(/(?:from|join)\s+"(\w+)"/gi)).map(m => m[1]);
    for (const table of tables) {
        if (!allowedTables.includes(table)) {
            return { error: `Invalid table used: ${table}` };
        }
    }

    return await new Promise((resolve, reject) => {
        db.all(sql.trim(), (error, result) => {
            if (error) {
                resolve({
                    error: error.message,
                    failedQuery: sql.trim()
                });
            } else {
                resolve({ result });
            }
        });
    });
}