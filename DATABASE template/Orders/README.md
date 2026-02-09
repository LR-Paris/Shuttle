# Orders Folder

## Overview
This folder stores customer orders submitted through the B2B storefront. Each order is saved as a JSON file with a unique order ID.

## Important Notes
- **Generated Automatically** - This folder is populated by the system when customers place orders
- **Do NOT manually create files here** - Orders are created through the checkout process
- **Read-only for most purposes** - Use for order fulfillment and record-keeping

## Folder Structure

```
Orders/
├── README.md                              # This file
├── order_1738779234567_abc123.json       # Individual order file
├── order_1738779456789_def456.json       # Individual order file
└── ...                                    # More orders as they come in
```

## File Naming Convention

**Format:** `order_[timestamp]_[randomId].json`

**Components:**
- `order_` - Prefix for all order files
- `[timestamp]` - Unix timestamp (milliseconds) when order was placed
- `_` - Underscore separator
- `[randomId]` - Short random alphanumeric string for uniqueness
- `.json` - JSON format extension

**Example:** `order_1738779234567_x9k2m.json`
- Timestamp: 1738779234567 (corresponds to specific date/time)
- Random ID: x9k2m
- Ensures unique filename for each order

## Order File Format

Each order file is a JSON document with the following structure:

```json
{
  "orderId": "order_1738779234567_x9k2m",
  "timestamp": 1738779234567,
  "date": "2026-02-05T14:23:54.567Z",
  "customer": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "company": "Smith Retail Inc.",
    "phone": "555-0123",
    "address": {
      "street": "123 Main Street",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701",
      "country": "USA"
    }
  },
  "items": [
    {
      "productId": "office-essentials-designer-tote-bag",
      "productName": "Designer Tote Bag",
      "collectionName": "Office Essentials",
      "sku": "TOTE-001",
      "quantity": 2,
      "unitType": "box",
      "pricePerUnit": 249.00,
      "unitsPerBox": 12,
      "totalItems": 24,
      "lineTotal": 498.00
    },
    {
      "productId": "pet-accessories-premium-dog-bowl",
      "productName": "Premium Dog Bowl",
      "collectionName": "Pet Accessories",
      "sku": "PET-BOWL-001",
      "quantity": 1,
      "unitType": "item",
      "pricePerUnit": 12.50,
      "unitsPerBox": 12,
      "totalItems": 1,
      "lineTotal": 12.50
    }
  ],
  "summary": {
    "subtotal": 510.50,
    "shipping": 0.00,
    "tax": 0.00,
    "total": 510.50,
    "itemCount": 2,
    "totalQuantity": 25
  },
  "notes": "Please deliver before end of month. Loading dock available 8am-5pm.",
  "status": "pending"
}
```

## Field Definitions

### Order Level

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | string | Unique order identifier (matches filename) |
| `timestamp` | number | Unix timestamp in milliseconds |
| `date` | string | ISO 8601 formatted date/time |
| `customer` | object | Customer information |
| `items` | array | Array of ordered products |
| `summary` | object | Order totals and counts |
| `notes` | string | Customer notes/special instructions |
| `status` | string | Order status (pending, processing, completed, cancelled) |

### Customer Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Customer full name |
| `email` | string | Customer email address |
| `company` | string | Company name |
| `phone` | string | Phone number |
| `address` | object | Shipping address |

### Address Object

| Field | Type | Description |
|-------|------|-------------|
| `street` | string | Street address |
| `city` | string | City |
| `state` | string | State/province |
| `zip` | string | ZIP/postal code |
| `country` | string | Country |

### Item Object

| Field | Type | Description |
|-------|------|-------------|
| `productId` | string | Product slug ID |
| `productName` | string | Display name |
| `collectionName` | string | Collection name |
| `sku` | string | Product SKU |
| `quantity` | number | Number of units ordered |
| `unitType` | string | "box" or "item" |
| `pricePerUnit` | number | Price per box or item |
| `unitsPerBox` | number | Items included per box |
| `totalItems` | number | Total individual items (calculated) |
| `lineTotal` | number | Total price for this line |

### Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | number | Sum of all line totals |
| `shipping` | number | Shipping cost (currently 0) |
| `tax` | number | Tax amount (currently 0) |
| `total` | number | Grand total |
| `itemCount` | number | Number of distinct products |
| `totalQuantity` | number | Total items/boxes ordered |

## Order Processing Workflow

### 1. Order Creation
- Customer completes checkout form
- System generates unique order ID
- Order saved as JSON file in this folder
- Confirmation page shown to customer

### 2. Order Fulfillment (Manual)
- Business owner/staff checks this folder
- Reads order files
- Processes and ships orders
- Updates order status (if tracking implemented)

### 3. Record Keeping
- Orders remain in this folder indefinitely
- Can be archived or backed up as needed
- Serves as order history

## How Orders Are Created

### Code Flow:

1. **Checkout Page** (`app/checkout/page.tsx`):
   - Customer fills out form
   - Submits order with cart items

2. **API Endpoint** (`app/api/orders/route.ts`):
   - Receives order data
   - Validates information
   - Generates unique order ID
   - Creates JSON file in Orders folder
   - Returns success response

3. **Success Page** (`app/order-success/page.tsx`):
   - Displays confirmation
   - Shows order ID
   - Provides order summary

## For AI Assistants

### Reading Orders:

```typescript
import fs from 'fs';
import path from 'path';

const ORDERS_PATH = path.join(process.cwd(), 'DATABASE', 'Orders');

// Get all orders
function getAllOrders() {
  const files = fs.readdirSync(ORDERS_PATH);
  const orderFiles = files.filter(f => f.startsWith('order_') && f.endsWith('.json'));

  return orderFiles.map(file => {
    const content = fs.readFileSync(path.join(ORDERS_PATH, file), 'utf-8');
    return JSON.parse(content);
  });
}

// Get single order
function getOrder(orderId: string) {
  const filePath = path.join(ORDERS_PATH, `${orderId}.json`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}
```

### Creating Orders:

```typescript
import fs from 'fs';
import path from 'path';

function createOrder(orderData: any) {
  // Generate unique order ID
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const orderId = `order_${timestamp}_${randomId}`;

  // Add metadata
  const order = {
    orderId,
    timestamp,
    date: new Date().toISOString(),
    ...orderData,
    status: 'pending'
  };

  // Save to file
  const filePath = path.join(ORDERS_PATH, `${orderId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(order, null, 2), 'utf-8');

  return orderId;
}
```

### Common Operations:

**List all orders:**
```typescript
const orders = getAllOrders();
console.log(`Total orders: ${orders.length}`);
```

**Find orders by status:**
```typescript
const pendingOrders = orders.filter(o => o.status === 'pending');
```

**Find orders by customer:**
```typescript
const customerOrders = orders.filter(o =>
  o.customer.email === 'customer@example.com'
);
```

**Calculate total revenue:**
```typescript
const totalRevenue = orders.reduce((sum, order) =>
  sum + order.summary.total, 0
);
```

## Order Management Features (Future)

### Potential Enhancements:
- Order status tracking (pending → processing → shipped → delivered)
- Email notifications to customers
- Admin dashboard for order management
- Search and filter orders
- Export orders to CSV/Excel
- Integration with shipping providers
- Inventory management
- Order analytics and reporting

### Status Values:
- `pending` - Order received, not yet processed
- `processing` - Order being prepared
- `shipped` - Order shipped to customer
- `delivered` - Order received by customer
- `cancelled` - Order cancelled

## Best Practices

### For Developers:
1. **Always validate order data** before saving
2. **Use atomic writes** to prevent corruption
3. **Generate truly unique IDs** (timestamp + random)
4. **Log errors** when order creation fails
5. **Backup orders regularly** (they're critical business data)
6. **Never delete orders** without explicit authorization

### For Business Owners:
1. **Check this folder regularly** for new orders
2. **Process orders promptly**
3. **Keep orders organized** (consider archiving old orders)
4. **Backup this folder** regularly
5. **Secure customer data** properly (PII contained in orders)

## Data Privacy & Security

**Important Considerations:**
- Orders contain PII (Personally Identifiable Information)
- Store securely, limit access
- Comply with privacy regulations (GDPR, CCPA, etc.)
- Consider encryption for sensitive data
- Implement access controls
- Have data retention policy
- Provide customer data upon request (right to access)
- Delete customer data upon request (right to erasure)

## Troubleshooting

**Orders not saving?**
- Check folder permissions (must be writable)
- Verify Orders folder exists
- Check API endpoint is working
- Review server logs for errors

**Can't read order files?**
- Verify JSON is valid (use JSON validator)
- Check file permissions (must be readable)
- Ensure file extension is .json
- Try parsing with JSON.parse()

**Duplicate orders?**
- Check for double-submissions
- Implement client-side prevention (disable button after submit)
- Add server-side deduplication
- Use more robust random ID generation

## File Management

### Archiving Old Orders:
```bash
# Create archive folder
mkdir -p DATABASE/Orders/Archive/2025

# Move old orders (example)
mv DATABASE/Orders/order_1704* DATABASE/Orders/Archive/2025/
```

### Backing Up Orders:
```bash
# Backup entire Orders folder
tar -czf orders_backup_2026-02-05.tar.gz DATABASE/Orders/

# Or use rsync
rsync -av DATABASE/Orders/ /backup/location/Orders/
```

### Searching Orders:
```bash
# Find orders by email
grep -r "customer@example.com" DATABASE/Orders/

# Find orders over $1000
grep -r '"total": [1-9][0-9][0-9][0-9]' DATABASE/Orders/

# Count total orders
ls DATABASE/Orders/order_*.json | wc -l
```

## Next Steps

### For Implementation:
1. Ensure API route is handling POST requests
2. Validate all order data before saving
3. Test order creation end-to-end
4. Implement error handling
5. Add order confirmation emails (optional)
6. Create admin interface for viewing orders (future)

### For Business Operations:
1. Set up order processing workflow
2. Configure order notifications
3. Establish fulfillment procedures
4. Set up regular backups
5. Define data retention policy
6. Train staff on order management
