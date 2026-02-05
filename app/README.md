# App Folder (Next.js App Router)

## Overview
This folder contains the Next.js 13+ App Router structure for the B2B storefront. It defines all pages, layouts, and API routes for the application.

## Technology Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Server Components** - Default rendering strategy

## Folder Structure

```
app/
├── README.md                       # This file
├── layout.tsx                      # Root layout (wraps all pages)
├── page.tsx                        # Homepage (/)
├── collections/
│   ├── page.tsx                   # Collections list (/collections)
│   └── [collectionId]/
│       └── page.tsx               # Collection detail (/collections/[id])
├── products/
│   └── [productId]/
│       └── page.tsx               # Product detail (/products/[id])
├── cart/
│   └── page.tsx                   # Shopping cart (/cart)
├── checkout/
│   └── page.tsx                   # Checkout form (/checkout)
├── order-success/
│   └── page.tsx                   # Order confirmation (/order-success)
└── api/
    ├── design/
    │   └── route.ts               # GET /api/design - Design data
    ├── products/
    │   └── [productId]/
    │       └── route.ts           # GET /api/products/[id] - Product data
    ├── orders/
    │   └── route.ts               # POST /api/orders - Create order
    └── images/
        ├── products/
        │   └── [productId]/
        │       └── [filename]/
        │           └── route.ts   # GET /api/images/products/[id]/[file]
        └── logos/
            └── [filename]/
                └── route.ts       # GET /api/images/logos/[file]
```

## Routing System

Next.js App Router uses file-system based routing:

| File Path | URL | Description |
|-----------|-----|-------------|
| `app/page.tsx` | `/` | Homepage |
| `app/collections/page.tsx` | `/collections` | All collections |
| `app/collections/[collectionId]/page.tsx` | `/collections/pet-accessories` | Collection detail |
| `app/products/[productId]/page.tsx` | `/products/pet-accessories-dog-bowl` | Product detail |
| `app/cart/page.tsx` | `/cart` | Shopping cart |
| `app/checkout/page.tsx` | `/checkout` | Checkout form |
| `app/order-success/page.tsx` | `/order-success` | Order confirmation |

## Key Files Explained

### layout.tsx (Root Layout)
**Purpose:** Wraps all pages with shared layout elements

**Features:**
- Header with logo and navigation
- Shopping cart link
- Footer
- Global styles
- Metadata configuration

**When to modify:**
- Add/remove global navigation items
- Change header/footer content
- Update site-wide metadata
- Add global providers (context, etc.)

---

### page.tsx (Homepage)
**Purpose:** Landing page for the storefront

**Current Features:**
- Company name and tagline
- About section
- Collections preview grid
- "Browse Collections" CTA button

**Future Enhancements:**
- Hero image section (from ShowcasePhotos)
- Featured products
- Promotional banners
- Testimonials

**Data Sources:**
- `getDesignData()` - Company name, colors, descriptions
- `getAllCollections()` - Collections list

---

### collections/page.tsx
**Purpose:** Display all product collections

**Features:**
- Grid of all collections
- Product count per collection
- Links to collection detail pages

**Data Source:**
- `getAllCollections()` from lib/catalog.ts

---

### collections/[collectionId]/page.tsx
**Purpose:** Display products in a specific collection

**URL Parameters:**
- `collectionId` - Collection slug (e.g., "pet-accessories")

**Features:**
- Collection name as heading
- Grid of all products in collection
- Product images, names, SKUs
- Add to cart functionality
- Pricing calculator (boxes vs items)

**Data Sources:**
- `getCollection(collectionId)` - Collection and products

---

### products/[productId]/page.tsx
**Purpose:** Detailed product page

**URL Parameters:**
- `productId` - Product slug (e.g., "pet-accessories-premium-dog-bowl")

**Features:**
- Product image gallery
- Full product details
- SKU, description, pricing
- Quantity selector (boxes or items)
- Add to cart button
- Pricing calculator

**Data Sources:**
- `getProduct(productId)` - Product details

---

### cart/page.tsx
**Purpose:** Shopping cart review

**Features:**
- List of cart items with images
- Quantity adjustment
- Remove items
- Subtotal calculation
- Proceed to checkout button
- Continue shopping link

**State Management:**
- Client-side cart state (localStorage)
- Real-time updates

---

### checkout/page.tsx
**Purpose:** Checkout form and order submission

**Features:**
- Customer information form
  - Name, email, company, phone
  - Shipping address
  - Order notes
- Order summary
- Submit order button

**Form Handling:**
- Client-side validation
- POST to /api/orders
- Redirect to order success page

---

### order-success/page.tsx
**Purpose:** Order confirmation page

**Features:**
- Success message
- Order ID display
- Order summary
- Clear cart
- Return to homepage link

**When shown:**
- After successful order submission
- Order ID passed via URL query parameter

---

## API Routes

### GET /api/design
**File:** `app/api/design/route.ts`

**Purpose:** Return design/branding data

**Response:**
```json
{
  "colors": { ... },
  "companyName": "...",
  "descriptions": { ... },
  "logoPath": "/api/images/logos/logo.png",
  ...
}
```

**Used by:** Frontend components needing design data

---

### GET /api/products/[productId]
**File:** `app/api/products/[productId]/route.ts`

**Purpose:** Return single product data

**Parameters:**
- `productId` - Product slug

**Response:**
```json
{
  "id": "...",
  "name": "...",
  "description": "...",
  "sku": "...",
  "itemCost": 12.50,
  "boxCost": 120.00,
  "unitsPerBox": 12,
  "images": [...],
  "collectionId": "...",
  "collectionName": "..."
}
```

**Status Codes:**
- 200 - Success
- 404 - Product not found

---

### POST /api/orders
**File:** `app/api/orders/route.ts`

**Purpose:** Create new order

**Request Body:**
```json
{
  "customer": { ... },
  "items": [...],
  "summary": { ... },
  "notes": "..."
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_1738779234567_x9k2m"
}
```

**Side Effects:**
- Creates JSON file in DATABASE/Orders/
- Order file contains all order details

---

### GET /api/images/products/[productId]/[filename]
**File:** `app/api/images/products/[productId]/[filename]/route.ts`

**Purpose:** Serve product images

**Parameters:**
- `productId` - Product slug
- `filename` - Image filename (e.g., "main.png")

**Supported Formats:**
- .png, .jpg, .jpeg, .gif, .webp

**Response:**
- Image binary data
- Appropriate content-type header

**Status Codes:**
- 200 - Success
- 404 - Image not found

---

### GET /api/images/logos/[filename]
**File:** `app/api/images/logos/[filename]/route.ts`

**Purpose:** Serve logo images

**Parameters:**
- `filename` - Logo filename (e.g., "logo.png", "favicon.ico")

**Supported Files:**
- logo.png, logo.jpg
- logo-white.png, logo-white.jpg
- favicon.ico

**Response:**
- Image binary data
- Appropriate content-type header

---

## For AI Assistants

### Creating New Pages:

**Basic Page:**
```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p>Page content</p>
    </div>
  );
}
```

**Dynamic Page:**
```typescript
// app/items/[id]/page.tsx
export default function ItemPage({ params }: { params: { id: string } }) {
  const itemId = params.id;
  // Fetch data based on itemId
  return <div>Item: {itemId}</div>;
}
```

### Creating API Routes:

**GET Route:**
```typescript
// app/api/data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const data = { message: 'Hello' };
  return NextResponse.json(data);
}
```

**POST Route:**
```typescript
// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process data
  return NextResponse.json({ success: true });
}
```

**Dynamic Route:**
```typescript
// app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // Fetch item by id
  return NextResponse.json({ id, data: '...' });
}
```

### Accessing Design Data:

```typescript
import { getDesignData } from '@/lib/design';

export default function Page() {
  const design = getDesignData();

  return (
    <div style={{ color: design.colors.primary }}>
      <h1>{design.companyName}</h1>
      <p>{design.descriptions.tagline}</p>
    </div>
  );
}
```

### Accessing Catalog Data:

```typescript
import { getAllCollections, getProduct } from '@/lib/catalog';

export default function Page() {
  const collections = getAllCollections();
  const product = getProduct('product-id');

  return <div>...</div>;
}
```

### Using Tailwind for Styling:

```typescript
<div className="container mx-auto px-4 py-12">
  <h1 className="text-3xl font-bold mb-4">Title</h1>
  <p className="text-lg text-gray-600">Description</p>
  <button className="bg-blue-500 text-white px-6 py-2 rounded">
    Click Me
  </button>
</div>
```

### Applying Design Colors:

```typescript
const design = getDesignData();

<button
  className="px-6 py-2 text-white rounded"
  style={{ backgroundColor: design.colors.secondary }}
>
  Add to Cart
</button>
```

## Common Modifications

### Adding a New Page:
1. Create folder in `app/`
2. Add `page.tsx` file
3. Export default React component
4. Add navigation link in layout.tsx (if needed)

### Adding a New API Endpoint:
1. Create folder structure in `app/api/`
2. Add `route.ts` file
3. Export `GET`, `POST`, `PUT`, `DELETE` functions as needed
4. Return NextResponse with data

### Modifying Homepage:
1. Edit `app/page.tsx`
2. Use getDesignData() for branding
3. Use getAllCollections() for collections
4. Follow existing Tailwind styling patterns

### Adding Hero Section (Future):
1. Update `app/page.tsx`
2. Import showcase image functions from lib/design.ts
3. Add hero section with background image
4. Overlay company name and tagline
5. Style responsively with Tailwind

## Styling Guidelines

### Container:
```typescript
<div className="container mx-auto px-4 py-12">
```

### Headings:
```typescript
<h1 className="text-3xl font-bold mb-4">
<h2 className="text-2xl font-bold mb-3">
<h3 className="text-xl font-semibold mb-2">
```

### Buttons:
```typescript
// Primary button
<button className="px-6 py-2 text-white rounded"
        style={{ backgroundColor: design.colors.secondary }}>

// Secondary button
<button className="px-6 py-2 border rounded"
        style={{ borderColor: design.colors.border }}>
```

### Grids:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

### Cards:
```typescript
<div className="border rounded-lg p-6"
     style={{ borderColor: design.colors.border }}>
```

## Best Practices

1. **Server Components by default** - Use 'use client' only when needed
2. **Use design data** - Apply colors from getDesignData()
3. **Consistent styling** - Follow existing Tailwind patterns
4. **Responsive design** - Use md:, lg: breakpoints
5. **Type safety** - Use TypeScript types
6. **Error handling** - Handle missing data gracefully
7. **SEO** - Add proper metadata to pages
8. **Accessibility** - Use semantic HTML, ARIA labels

## File Conventions

### Page Files:
- Named `page.tsx`
- Export default component
- Can be async for data fetching

### Layout Files:
- Named `layout.tsx`
- Export default component with children prop
- Define shared layout for routes

### API Route Files:
- Named `route.ts`
- Export HTTP method functions (GET, POST, etc.)
- Return NextResponse

### Loading Files:
- Named `loading.tsx`
- Export default component
- Shown while page loads

### Error Files:
- Named `error.tsx`
- Export default component
- Handles errors in that route segment

## Next Steps

### Immediate:
1. Implement showcase photos on homepage
2. Add API route for showcase images
3. Test all existing pages
4. Verify responsive design

### Future Enhancements:
1. Add search functionality
2. Implement product filtering
3. Add order history page (customer portal)
4. Create admin dashboard
5. Add user authentication
6. Implement real-time inventory
7. Add analytics tracking
8. Improve SEO/metadata
