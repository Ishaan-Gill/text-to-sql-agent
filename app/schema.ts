export const schemaDocs = [
    `Table: customer
Columns:
- id
- name
- email

Relationships:
customer.id -> order.customerid
`,

    `Table: order
Columns:
- id
- createdate
- shippingcost
- customerid

Relationships:
order.customerid -> customer.id
`
];