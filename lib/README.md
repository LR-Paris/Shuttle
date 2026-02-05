# Lib Folder (Library/Utilities)

## Overview
This folder contains reusable utility functions and data access layer for the B2B storefront. These modules provide clean APIs for accessing data from the DATABASE folder and managing application state.

## Files

```
lib/
├── README.md     # This file
├── catalog.ts    # Product and collection data access
├── design.ts     # Design and branding data access
└── cart.ts       # Shopping cart state management
```

## catalog.ts - Product Catalog Access

**Purpose:** Read and parse product/collection data from `DATABASE/ShopCollections/`

### Exports

#### Types:

```typescript
interface Product {
  id: string;              // Slug: "collection-product"
  name: string;            // From Name.txt
  description: string;     // From Description.txt
  sku: string;             // From SKU.txt
  itemCost: number;        // From ItemCost.txt
  boxCost: number;         // From BoxCost.txt
  unitsPerBox: number;     // From UnitsPerBox.txt
  images: string[];        // Array of image URLs
  collectionId: string;    // Collection slug
  collectionName: string;  // Collection display name
}

interface Collection {
  id: string;              // Collection slug
  name: string;            // Collection display name
  products: Product[];     // Array of products in collection
}
```

#### Functions:

**`getAllCollections(): Collection[]`**
- Returns array of all collections with their products
- Reads from DATABASE/ShopCollections/
- Filters out invalid collections (no valid products)
- Example:
  ```typescript
  const collections = getAllCollections();
  // [{ id: "pet-accessories", name: "Pet Accessories", products: [...] }, ...]
  ```

**`getCollection(collectionId: string): Collection | null`**
- Returns single collection by ID
- Returns null if not found
- Example:
  ```typescript
  const collection = getCollection("pet-accessories");
  if (collection) {
    console.log(collection.name); // "Pet Accessories"
  }
  ```

**`getProduct(productId: string): Product | null`**
- Returns single product by ID
- Returns null if not found
- Example:
  ```typescript
  const product = getProduct("pet-accessories-dog-bowl");
  if (product) {
    console.log(product.name); // "Premium Dog Bowl"
  }
  ```

**`getAllProducts(): Product[]`**
- Returns flat array of all products from all collections
- Example:
  ```typescript
  const allProducts = getAllProducts();
  console.log(allProducts.length); // Total number of products
  ```

### Internal Functions:

**`slugify(text: string): string`**
- Converts text to URL-safe slug
- Example: "Pet Accessories" → "pet-accessories"

**`readDetailsFile(detailsPath: string, filename: string): string`**
- Reads a .txt file from Details folder
- Returns trimmed content or empty string if missing

**`getProductImages(photosPath: string, productId: string): string[]`**
- Scans Photos folder for images
- Supports: .jpg, .jpeg, .png, .gif, .webp
- Returns array of API URLs
- Example: `["/api/images/products/pet-accessories-dog-bowl/main.png"]`

**`parseProduct(...): Product | null`**
- Parses product from folder structure
- Validates required fields (Name, SKU)
- Returns null if invalid

**`parseCollection(...): Collection | null`**
- Parses collection from folder structure
- Returns null if no valid products

### Usage Examples:

**In a page component:**
```typescript
import { getAllCollections, getProduct } from '@/lib/catalog';

export default function CollectionsPage() {
  const collections = getAllCollections();

  return (
    <div>
      {collections.map(collection => (
        <div key={collection.id}>
          <h2>{collection.name}</h2>
          <p>{collection.products.length} products</p>
        </div>
      ))}
    </div>
  );
}
```

**In an API route:**
```typescript
import { getProduct } from '@/lib/catalog';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = getProduct(params.id);

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}
```

---

## design.ts - Design/Branding Access

**Purpose:** Read and parse design data from `DATABASE/Design/`

### Exports

#### Types:

```typescript
interface Colors {
  primary: string;      // Main brand color
  secondary: string;    // Secondary/CTA color
  accent: string;       // Accent color
  background: string;   // Background color
  text: string;         // Main text color
  textLight: string;    // Secondary text color
  border: string;       // Border color
  success: string;      // Success message color
}

interface Descriptions {
  tagline: string;      // Homepage tagline
  about: string;        // About section text
  footer: string;       // Footer text
}

interface DesignData {
  colors: Colors;
  companyName: string;
  descriptions: Descriptions;
  logoPath: string | null;        // /api/images/logos/logo.png
  logoWhitePath: string | null;   // /api/images/logos/logo-white.png
  faviconPath: string | null;     // /api/images/logos/favicon.ico
}
```

#### Functions:

**`getColors(): Colors`**
- Reads Colors.txt and parses key-value pairs
- Returns default colors if file missing/invalid
- Example:
  ```typescript
  const colors = getColors();
  console.log(colors.primary); // "#1a1a1a"
  ```

**`getCompanyName(): string`**
- Reads CompanyName.txt
- Returns "B2B Storefront" if missing
- Example:
  ```typescript
  const name = getCompanyName();
  console.log(name); // "Whiskers & Co. B2B Supply"
  ```

**`getDescriptions(): Descriptions`**
- Reads Descriptions.txt and parses key-value pairs
- Returns default descriptions if missing
- Example:
  ```typescript
  const desc = getDescriptions();
  console.log(desc.tagline); // "Purr-fect wholesale products..."
  ```

**`getDesignData(): DesignData`**
- Combines all design data into single object
- This is the main function to use
- Example:
  ```typescript
  const design = getDesignData();
  ```

### Internal Functions:

**`parseKeyValueFile(content: string): Record<string, string>`**
- Parses "key: value" format files
- Supports comments (# prefix)
- Ignores blank lines
- Example:
  ```
  primary: #1a1a1a
  secondary: #ff6600
  # This is a comment
  ```

**`getLogoPath(filename: string): string | null`**
- Checks if logo file exists
- Returns API path or null
- Currently checks for: logo.png, logo-white.png, favicon.ico

### Usage Examples:

**Apply colors in component:**
```typescript
import { getDesignData } from '@/lib/design';

export default function Header() {
  const design = getDesignData();

  return (
    <header style={{ backgroundColor: design.colors.primary }}>
      <h1 style={{ color: design.colors.background }}>
        {design.companyName}
      </h1>
    </header>
  );
}
```

**Inline styles with Tailwind:**
```typescript
const design = getDesignData();

<button
  className="px-6 py-2 text-white rounded"
  style={{ backgroundColor: design.colors.secondary }}
>
  Add to Cart
</button>
```

**In API route:**
```typescript
import { getDesignData } from '@/lib/design';
import { NextResponse } from 'next/server';

export async function GET() {
  const design = getDesignData();
  return NextResponse.json(design);
}
```

---

## cart.ts - Shopping Cart Management

**Purpose:** Client-side shopping cart state management using localStorage

### Exports

#### Types:

```typescript
interface CartItem {
  productId: string;      // Product slug
  productName: string;    // Display name
  sku: string;            // Product SKU
  boxCost: number;        // Cost per box
  unitsPerBox: number;    // Items in a box
  quantity: number;       // Number of boxes
}

interface Cart {
  items: CartItem[];
  total: number;          // Calculated total
}
```

#### Functions:

**`getCart(): Cart`**
- Reads cart from localStorage
- Returns empty cart if not found
- Returns empty cart on server (window undefined)
- Example:
  ```typescript
  const cart = getCart();
  console.log(cart.items.length); // Number of items
  ```

**`saveCart(cart: Cart): void`**
- Saves cart to localStorage
- Does nothing on server
- Example:
  ```typescript
  saveCart({ items: [], total: 0 });
  ```

**`calculateTotal(items: CartItem[]): number`**
- Calculates total from cart items
- Formula: sum of (boxCost × quantity)
- Example:
  ```typescript
  const total = calculateTotal(cartItems);
  console.log(total); // 498.00
  ```

**`addToCart(productId, productName, sku, boxCost, unitsPerBox, quantity): Cart`**
- Adds product to cart
- If already in cart, increases quantity
- Updates total and saves
- Returns updated cart
- Example:
  ```typescript
  const cart = addToCart(
    "pet-accessories-dog-bowl",
    "Premium Dog Bowl",
    "PET-BOWL-001",
    120.00,
    12,
    2
  );
  ```

**`updateCartItemQuantity(productId: string, quantity: number): Cart`**
- Updates quantity of cart item
- If quantity <= 0, removes item
- Updates total and saves
- Returns updated cart
- Example:
  ```typescript
  const cart = updateCartItemQuantity("pet-accessories-dog-bowl", 3);
  ```

**`removeFromCart(productId: string): Cart`**
- Removes item from cart
- Updates total and saves
- Returns updated cart
- Example:
  ```typescript
  const cart = removeFromCart("pet-accessories-dog-bowl");
  ```

**`clearCart(): Cart`**
- Removes all items from cart
- Returns empty cart
- Example:
  ```typescript
  const cart = clearCart();
  ```

### Storage:

**localStorage key:** `b2b_cart`

**Stored format:**
```json
{
  "items": [
    {
      "productId": "pet-accessories-dog-bowl",
      "productName": "Premium Dog Bowl",
      "sku": "PET-BOWL-001",
      "boxCost": 120.00,
      "unitsPerBox": 12,
      "quantity": 2
    }
  ],
  "total": 240.00
}
```

### Usage Examples:

**Add to cart (client component):**
```typescript
'use client';
import { useState } from 'react';
import { addToCart } from '@/lib/cart';

export default function ProductPage({ product }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const cart = addToCart(
      product.id,
      product.name,
      product.sku,
      product.boxCost,
      product.unitsPerBox,
      quantity
    );
    alert(`Added to cart! Total: $${cart.total.toFixed(2)}`);
  };

  return (
    <button onClick={handleAddToCart}>
      Add {quantity} to Cart
    </button>
  );
}
```

**Display cart:**
```typescript
'use client';
import { useEffect, useState } from 'react';
import { getCart, removeFromCart } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
  };

  return (
    <div>
      {cart.items.map(item => (
        <div key={item.productId}>
          <h3>{item.productName}</h3>
          <p>Quantity: {item.quantity} boxes</p>
          <p>Price: ${(item.boxCost * item.quantity).toFixed(2)}</p>
          <button onClick={() => handleRemove(item.productId)}>
            Remove
          </button>
        </div>
      ))}
      <p>Total: ${cart.total.toFixed(2)}</p>
    </div>
  );
}
```

---

## For AI Assistants

### Adding New Functionality:

**To add showcase image support to design.ts:**

1. Add to DesignData interface:
```typescript
export interface DesignData {
  // ... existing fields
  heroImagePath: string | null;
  bannerImages: string[];
}
```

2. Add helper function:
```typescript
function getHeroImage(): string | null {
  const SHOWCASE_PATH = path.join(DESIGN_PATH, 'ShowcasePhotos');
  const formats = ['hero.png', 'hero.jpg', 'hero.jpeg'];

  for (const format of formats) {
    const imagePath = path.join(SHOWCASE_PATH, format);
    if (fs.existsSync(imagePath)) {
      return `/api/images/showcase/${format}`;
    }
  }
  return null;
}
```

3. Update getDesignData():
```typescript
export function getDesignData(): DesignData {
  return {
    colors: getColors(),
    companyName: getCompanyName(),
    descriptions: getDescriptions(),
    logoPath: getLogoPath('logo.png'),
    logoWhitePath: getLogoPath('logo-white.png'),
    faviconPath: getLogoPath('favicon.ico'),
    heroImagePath: getHeroImage(),  // New
    bannerImages: getBannerImages(), // New
  };
}
```

### Supporting Both PNG and JPG:

All image-related functions already support multiple formats:

**In catalog.ts:**
```typescript
const imageFiles = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
});
```

**In design.ts (to be implemented):**
```typescript
function getLogoPath(filename: string): string | null {
  // Check for both .png and .jpg versions
  const baseName = path.parse(filename).name;
  const formats = ['.png', '.jpg', '.jpeg'];

  for (const ext of formats) {
    const fullName = baseName + ext;
    const logoPath = path.join(DESIGN_PATH, 'Logos', fullName);
    if (fs.existsSync(logoPath)) {
      return `/api/images/logos/${fullName}`;
    }
  }
  return null;
}
```

### Common Patterns:

**File system read:**
```typescript
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'DATABASE', 'folder', 'file.txt');
const content = fs.readFileSync(filePath, 'utf-8').trim();
```

**Check file exists:**
```typescript
if (fs.existsSync(filePath)) {
  // File exists
}
```

**Read directory:**
```typescript
const items = fs.readdirSync(folderPath, { withFileTypes: true });
const folders = items.filter(item => item.isDirectory());
```

**Parse key-value format:**
```typescript
const lines = content.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const colonIndex = trimmed.indexOf(':');
  if (colonIndex === -1) continue;

  const key = trimmed.substring(0, colonIndex).trim();
  const value = trimmed.substring(colonIndex + 1).trim();
  result[key] = value;
}
```

## Best Practices

1. **Always handle errors** - Wrap fs operations in try-catch
2. **Provide defaults** - Return sensible defaults when data missing
3. **Validate data** - Check required fields before returning
4. **Type safety** - Use TypeScript interfaces
5. **Cache when appropriate** - Consider memoization for expensive operations
6. **Server vs client** - cart.ts checks for window, others are server-only
7. **Consistent slugification** - Use same slugify logic throughout
8. **Support multiple formats** - Check for .png and .jpg interchangeably

## Troubleshooting

**Functions returning empty/default data?**
- Check DATABASE folder structure
- Verify file permissions
- Check file naming (case-sensitive)
- Review server logs for errors

**Cart not persisting?**
- Check if localStorage is available
- Verify browser allows localStorage
- Check for localStorage quota limits
- Test in incognito mode (some browsers restrict localStorage)

**Images not appearing?**
- Verify Photos/Logos folders exist
- Check file extensions (lowercase)
- Ensure API routes are set up
- Test API endpoints directly

## Next Steps

### Immediate Tasks:
1. Add showcase image functions to design.ts
2. Ensure both PNG and JPG support throughout
3. Add error logging for debugging
4. Consider adding caching layer

### Future Enhancements:
1. Add search/filter functions to catalog.ts
2. Implement cart persistence to database (optional)
3. Add cart sharing/save for later functionality
4. Implement product recommendations
5. Add analytics tracking
6. Cache frequently accessed data
7. Add validation functions
8. Create test suite for all functions
