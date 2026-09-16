# Orders Folder

## Overview
This folder stores customer orders submitted through the B2B storefront. Orders are saved in `orders.csv` and, for PO shops, uploaded Purchase Order PDFs are stored alongside.

## Important Notes
- **Generated Automatically** - This folder is populated by the system when customers place orders
- **Do NOT manually edit orders.csv** - Orders are appended through the checkout process
- **Read-only for most purposes** - Use for order fulfillment and record-keeping

## Folder Structure

```
Orders/
├── README.md              # This file
├── orders.csv             # All orders in CSV format
├── ORD-1738779234567-123.pdf   # PO file (only for PO shop type)
├── ORD-1738779456789-456.pdf   # PO file (only for PO shop type)
└── ...
```

## CSV Format (STS-2.00)

The `orders.csv` file has the following columns:

| # | Column | Description |
|---|--------|-------------|
| 1 | Order ID | Unique ID (e.g., `ORD-1738779234567-123`) |
| 2 | Date | ISO 8601 timestamp |
| 3 | Customer Name | Full name |
| 4 | Email | Customer email (if details enabled) |
| 5 | Phone | Customer phone (if details enabled) |
| 6 | Company | Company name (if details enabled) |
| 7 | Shipping Address | Full address (if address enabled) |
| 8 | Freight Option | `LR Paris` or `Own: Company (Account) - Contact` |
| 9 | Freight Company | Freight company name (if own freight) |
| 10 | Freight Account | Freight account number (if own freight) |
| 11 | Freight Contact | Freight contact info (if own freight) |
| 12 | Order Notes | Customer notes (if extra_notes enabled) |
| 13 | Items | JSON array of cart items |
| 14 | Total | Order total in dollars |
| 15 | Shop Type | `free`, `po`, or `stripe` |
| 16 | PO Number | Purchase Order number (PO shops only) |
| 17 | PO File | Filename of uploaded PO PDF (PO shops only) |
| 18 | Hotel Selection | Selected hotel name (if hotel_list enabled) |

**Note:** Columns 15-18 were added in STS-2.00. The system auto-migrates older CSV files.

## Shop Types and Order Behavior

### Free Shop (`type: free`)
- No payment or PO required
- Customer submits order with contact/shipping info
- Columns 15-18 will be: `free,,,`

### PO Shop (`type: po`)
- Customer must enter a PO Number and upload a PO PDF
- PDF is saved in this folder as `<OrderID>.pdf`
- Column 16 = PO number, Column 17 = PDF filename

### Stripe Shop (`type: stripe`)
- Coming soon - not yet implemented

## Which Fields Appear

Fields in the CSV depend on the toggles in `DATABASE/Presets/DataRequired.txt`:

| Toggle | CSV Columns Affected |
|--------|---------------------|
| `address: false` | Column 7 (Shipping Address) will be empty |
| `details: false` | Columns 4-6 (Email, Phone, Company) will be empty |
| `extra_notes: false` | Column 12 (Order Notes) will be empty |
| `shipping_handler: false` | Columns 8-11 (Freight) will be empty |
| `hotel_list: true` | Column 18 (Hotel Selection) will have the selected hotel |

## PO File Naming

For PO shop orders, the uploaded PDF is renamed to the Order ID:
- Order ID: `ORD-1738779234567-123`
- PO file saved as: `ORD-1738779234567-123.pdf`

This makes it easy to match each order row in the CSV to its corresponding PO document.

## For AI Assistants

When working with orders:
1. **Never manually edit** `orders.csv` - it's append-only
2. **Never delete** PO PDF files without authorization
3. The CSV header is auto-created and auto-migrated by the order API
4. Empty fields mean that toggle was disabled, not that data is missing
5. The Items column (13) contains a JSON array - parse it to get individual line items
