# 🧠 AI Text-to-SQL Assistant

Convert natural language into SQL queries using an AI-powered agent with schema awareness, automatic error correction, and a chat-based interface.

---

## 🚀 Overview

This project is an AI-driven SQL assistant that allows users to query a database using plain English.

Instead of writing SQL manually, users can ask questions like:

* "What is the total revenue generated?"
* "Which customer spent the most on electronics?"
* "List all customers with their orders"

The system translates these into SQL, executes them, and returns results — with automatic self-correction if queries fail.

---

## ✨ Key Features

* 🗣 Natural Language → SQL
  Converts user queries into valid SQL using an LLM

* 🧠 Schema-Aware Generation (RAG)
  Injects relevant database schema into prompts to improve accuracy

* 🔁 Automatic Error Correction
  If a query fails, the system:

  1. Detects the error
  2. Sends it back to the LLM
  3. Retries with a corrected query

* 🔗 Multi-Table Querying
  Handles joins across:

  * customer
  * order
  * product
  * order_item

* 🔒 Query Safety

  * Only allows SELECT queries
  * Blocks destructive operations (DROP, UPDATE, etc.)
  * Prevents multiple statements

* 💬 Chat-Based UI
  Interactive interface similar to ChatGPT

---

## 🛠 Tech Stack

* Frontend: Next.js, React, Tailwind CSS
* Backend: Next.js Server Actions
* Database: SQLite (in-memory)
* LLM: Groq (LLaMA 3.1)
* Frameworks: LangChain

---

## ⚙️ How It Works

1. User asks a question in natural language
2. Relevant schema is injected into the prompt
3. LLM generates a SQL query
4. Query executes on SQLite
5. If it fails → AI fixes and retries (up to 2 times)
6. Final result is returned to the UI

---

### Example

### Input

Which customer spent the most on electronics?

### Generated SQL

SELECT c.name, SUM(p.price * oi.quantity) AS total_spent
FROM "customer" c
JOIN "order" o ON c.id = o.customerid
JOIN "order_item" oi ON o.id = oi.order_id
JOIN "product" p ON oi.product_id = p.id
WHERE p.category = 'Electronics'
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 1;

### Output

Asha Kumari | 80000

---

## 🧪 Example Queries to Try

* Total revenue generated
* Show completed orders
* Which category generated most revenue?
* Top 3 customers by spending

---

## 📦 Setup

1. Clone repo
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name

2. Install dependencies
   npm install

3. Add environment variables

Create a `.env` file:

GOOGLE_API_KEY=your_api_key_here
GROQ_API_KEY=your_api_key_here

4. Run the app
   npm run dev

---

## ⚠️ Limitations

* Works on a predefined schema only
* Uses in-memory SQLite (data resets on restart)
* LLM may occasionally generate imperfect queries
* No pagination for large results

---

## 🧠 Future Improvements

* Table-based result UI
* Charts & data visualization
* Query explanation (natural language)
* Follow-up question support
* Persistent database (Postgres)
* Query optimization layer

---

## 💡 Why This Project Matters

This is not just an API wrapper — it demonstrates:

* AI + backend system design
* Error handling & self-correction loops
* Schema grounding (RAG)
* Safe query execution

Moving toward real-world AI-powered data tools.

---

Built by Ishaan Gill

---

Give it a star ⭐ — it helps!
