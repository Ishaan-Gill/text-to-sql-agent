"use server"

import {
    mapStoredMessagesToChatMessages,
    type StoredMessage,
} from "@langchain/core/messages";
import { execute } from "./database";
import { retriveRelevantSchema } from "./rag";
import Groq from "groq-sdk";
import { initDB } from "./database";

type QueryRow = Record<string, unknown>;
type QuerySuccess = {
    result: QueryRow[];
};
type QueryFailure = {
    error: string;
    failedQuery?: string;
};

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

function cleanSQL(content: string) {
    return content
        .replace(/```sql/g, "")
        .replace(/```/g, "")
        .trim();
}

function normalizeExecuteResult(value: unknown): QuerySuccess | QueryFailure {
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as QueryFailure;
        } catch {
            return { error: value };
        }
    }

    if (typeof value === "object" && value !== null) {
        if ("result" in value) {
            return value as QuerySuccess;
        }

        if ("error" in value) {
            return value as QueryFailure;
        }
    }

    return { error: "Unexpected database response" };
}

async function generateSQL(prompt: string) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content: "You are an expert SQL generator. Return SQL ONLY",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
        throw new Error("No response from model");
    }

    return cleanSQL(String(content));
}

function fixSQL(sql: string) {
    return sql
        .replace(/\bFROM\s+(\w+)(\s+\w+)?/gi, (_, table, alias) => {
            return `FROM "${table}"${alias ?? ""}`;
        })
        .replace(/\bJOIN\s+(\w+)(\s+\w+)?/gi, (_, table, alias) => {
            return `JOIN "${table}"${alias ?? ""}`;
        });
}

export async function message(messages: StoredMessage[]) {
    await initDB();
    const deserialized = mapStoredMessagesToChatMessages(messages);
    const latestMessage = deserialized.at(-1);
    const userQuery = typeof latestMessage?.content === "string"
        ? latestMessage.content
        : "";

    if (!userQuery) {
        throw new Error("A user message is required");
    }

    const relevantSchema = await retriveRelevantSchema(userQuery);
    const systemPrompt = `
You are an expert SQL generator.

Use this schema:
${relevantSchema}

STRICT:
Return ONLY SQL
No explanation
No markdown

ALWAYS wrap table names in double quotes.
Example:
"customer"
"order"
"product"
Never use unquoted table names.

Do NOT pluralize
The table names are CASE-SENSITIVE and EXACT
Any other table name is INVALID.
Only generate SELECT queries
Never modify the database
Never use multiple statements

Only use tables that are necessary for the user query.
Do NOT include joins unless required.

Column names:
customerid (NOT customer_id)
created_at (NOT createdat)

When calculating total revenue, prefer:
SELECT SUM("amount") FROM "order"

When listing customers with orders:
- Use INNER JOIN (exclude customers with no orders)

Use case-insensitive comparisons for text fields (e.g., LOWER(column) = LOWER('value'))

If you use aliases, ALWAYS use them consistently.
Do NOT mix alias and table name.
`;

    const prompt = `
${systemPrompt}
User query:
${userQuery}
`;
    const rawSQL = await generateSQL(prompt);
    const cleanedSQL = fixSQL(rawSQL);
    let currentResult = normalizeExecuteResult(await execute(cleanedSQL));

    const MAX_RETRIES = 2;
    let attempts = 0;

    while (attempts < MAX_RETRIES && "error" in currentResult) {
        attempts++;
        const failedQuery = currentResult.failedQuery ?? cleanedSQL;
        const fixPrompt = `
The following SQL query failed:

Query:
${failedQuery}

Error:
${currentResult.error}

Schema:
${relevantSchema}

STRICT FIX RULES:
- Use ONLY columns from schema
- order_item has: order_id, product_id, quantity
- product has: name, category, price
- order has: amount
- NEVER use columns like product_name or oi.amount

Correct join path:
customer → order → order_item → product

If calculating spending on a category:
SUM(product.price * order_item.quantity)

Fix ONLY the SQL.
Return ONLY the corrected SQL query.
`;
        const retriedRawSQL = await generateSQL(fixPrompt);
        const retriedSQL = fixSQL(retriedRawSQL);
        currentResult = normalizeExecuteResult(await execute(retriedSQL));
        console.log("retry attempts:", attempts);
        console.log("Fixed Sql:", retriedSQL);
    }

    console.log("final result:", currentResult);

    if ("error" in currentResult) {
        return currentResult.error;
    }

    return currentResult.result
        .map((row) =>
            Object.entries(row)
                .map(([k, v]) => `${k}: ${v}`))
        .join("\n\n");
}
