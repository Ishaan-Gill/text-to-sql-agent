export const schemaDocs = [
`Table: customer
Columns:
- id (PRIMARY KEY)
- name
- email
- city
- created_at

Relationships:
customer.id -> order.customerid
`,

`Table: order
Columns:
- id (PRIMARY KEY)
- customerid (FOREIGN KEY -> customer.id)
- amount
- status
- created_at

Relationships:
order.customerid -> customer.id
order.id -> order_item.order_id
`,

`Table: product
Columns:
- id (PRIMARY KEY)
- name
- category
- price

Relationships:
product.id -> order_item.product_id
`,

`Table: order_item
Columns:
- id (PRIMARY KEY)
- order_id (FOREIGN KEY -> order.id)
- product_id (FOREIGN KEY -> product.id)
- quantity

Relationships:
order_item.order_id -> order.id
order_item.product_id -> product.id
`
];